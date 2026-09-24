/**
 * Accounting derivation engine.
 *
 * Turns the DMS transactional records into Tally-shaped accounting views
 * WITHOUT asking the business to capture anything new. Every number here is
 * derived from fields the backend already returns.
 *
 * Two levels of confidence are tracked and surfaced in the UI:
 *   taxBasis "posted"  — the figure came from the backend as-is.
 *   taxBasis "derived" — the figure was computed here from rate x qty and the
 *                        product master's GST %, because the document itself
 *                        does not store a tax breakup.
 *
 * Known characteristics of the source data, handled below:
 *   - Sales contract/invoice rates are GST-INCLUSIVE (SaleSouda computes
 *     rate = contract_rate / (1 + gst%)), so sales tax is BACK-CALCULATED.
 *   - Purchase invoices DO store total_taxable_amount / igst_amount /
 *     grand_total, so purchase tax is taken as posted.
 *   - Purchase contracts store the combined GST rate in igst_percent.
 *   - No vendor payments exist, so purchase bills are treated as open.
 */
import {
  num,
  round2,
  toDate,
  monthKey,
  normState,
  pick,
  sumBy,
} from "./format";

export const VOUCHER_TYPES = {
  SALES: "Sales",
  PURCHASE: "Purchase",
  CREDIT_NOTE: "Credit Note",
  RECEIPT: "Receipt",
  PAYMENT: "Payment",
  FREIGHT: "Freight",
  JOURNAL: "Journal",
};

/* ================================================================== */
/* Context — master-data lookups shared by every report               */
/* ================================================================== */

export const buildContext = (core = {}) => {
  const {
    products = [],
    customers = [],
    vendors = [],
    organisation = null,
    inventory = [],
    brokers = [],
  } = core;

  const productById = new Map();
  products.forEach((p) => {
    const id = pick(p, "id", "product_id");
    if (id !== undefined) productById.set(String(id), p);
  });

  const productByName = new Map();
  products.forEach((p) => {
    const n = pick(p, "name", "product_name");
    if (n) productByName.set(String(n).trim().toLowerCase(), p);
  });

  const customerById = new Map();
  customers.forEach((c) => {
    const id = pick(c, "customer_id", "id");
    if (id !== undefined) customerById.set(String(id), c);
  });

  const customerByName = new Map();
  customers.forEach((c) => {
    const n = pick(c, "business_name", "customer_name", "name");
    if (n) customerByName.set(String(n).trim().toLowerCase(), c);
  });

  const vendorById = new Map();
  vendors.forEach((v) => {
    const id = pick(v, "id", "vendor_id");
    if (id !== undefined) vendorById.set(String(id), v);
  });

  const vendorByName = new Map();
  vendors.forEach((v) => {
    const n = pick(v, "registered_name", "name", "vendor_name", "company_name");
    if (n) vendorByName.set(String(n).trim().toLowerCase(), v);
  });

  const inventoryByProduct = new Map();
  inventory.forEach((i) => {
    const pid = pick(i, "product", "product_id");
    if (pid !== undefined) inventoryByProduct.set(String(pid), i);
  });

  // The company's own state decides CGST+SGST vs IGST.
  const orgState =
    pick(
      organisation || {},
      "state",
      "state_name",
      "hq_state",
      "registered_state",
    ) ||
    pick(organisation?.address || {}, "state", "state_name") ||
    pick(organisation?.branches?.[0] || {}, "state", "state_name") ||
    "";

  const orgName =
    pick(
      organisation || {},
      "registeredName",
      "registered_name",
      "name",
      "organisation_name",
    ) || "Organisation";

  const orgGstin =
    pick(organisation?.legal_details || organisation || {}, "gst_no", "gstin") || "";

  return {
    productById,
    productByName,
    customerById,
    customerByName,
    vendorById,
    vendorByName,
    inventoryByProduct,
    brokers,
    orgState,
    orgName,
    orgGstin,
    organisation,
  };
};

/** GST % for a line: product master first, then whatever the line carries. */
export const gstRateFor = (ctx, line = {}) => {
  const pid = pick(line, "product_id", "product", "productId");
  if (pid !== undefined) {
    const p = ctx.productById.get(String(pid));
    if (p) {
      const r = num(pick(p, "gst_percentage", "gst_percent", "gst"));
      if (r > 0) return r;
    }
  }
  const nameKey = String(pick(line, "product_name", "item_name", "item") || "")
    .trim()
    .toLowerCase();
  if (nameKey && ctx.productByName.has(nameKey)) {
    const r = num(ctx.productByName.get(nameKey).gst_percentage);
    if (r > 0) return r;
  }
  return num(pick(line, "gst_percentage", "gst_percent", "gst_rate"));
};

export const hsnFor = (ctx, line = {}) => {
  const direct = pick(line, "hsn_code", "hsn");
  if (direct) return direct;
  const pid = pick(line, "product_id", "product");
  if (pid !== undefined) {
    const p = ctx.productById.get(String(pid));
    if (p) return pick(p, "hsn_code", "hsn") || "-";
  }
  return "-";
};

/**
 * Split a GST amount into CGST/SGST or IGST.
 * Intra-state (party state === company state) => CGST + SGST, else IGST.
 */
export const splitGst = (gstAmount, partyState, orgState) => {
  const amt = round2(gstAmount);
  const intra =
    normState(partyState) &&
    normState(orgState) &&
    normState(partyState) === normState(orgState);
  if (intra) {
    const half = round2(amt / 2);
    return { cgst: half, sgst: round2(amt - half), igst: 0, intra: true };
  }
  return { cgst: 0, sgst: 0, igst: amt, intra: false };
};

/** Back-calculate tax out of a GST-inclusive amount. */
export const backOutTax = (inclusiveAmount, ratePct) => {
  const amt = num(inclusiveAmount);
  const rate = num(ratePct);
  if (rate <= 0) return { taxable: round2(amt), tax: 0 };
  const taxable = round2(amt / (1 + rate / 100));
  return { taxable, tax: round2(amt - taxable) };
};

/* ================================================================== */
/* Sales invoices -> Sales vouchers                                    */
/* ================================================================== */

/**
 * @param {object[]} list    rows from /sales/invoices/
 * @param {object[]} details rows from /sales/invoices/{id}/ (optional)
 */
export const buildSalesVouchers = (list = [], details = [], ctx) => {
  const detailById = new Map();
  details.forEach((d) => {
    const id = pick(d, "id", "sale_invoice_id", "invoice_id");
    if (id !== undefined) detailById.set(String(id), d);
  });

  return list.map((row) => {
    const id = pick(row, "id", "sale_invoice_id");
    const detail = detailById.get(String(id)) || null;
    const customerName =
      pick(row, "customer_name", "customer") ||
      pick(detail || {}, "customer_name") ||
      "-";
    const customer =
      ctx.customerByName.get(String(customerName).trim().toLowerCase()) || null;
    const partyState = pick(customer || {}, "state", "state_name") || "";

    const rawItems = detail?.items || detail?.invoice_items || [];
    let taxable = 0;
    let tax = 0;
    const items = rawItems.map((it, idx) => {
      const rate = num(pick(it, "rate", "unit_rate"));
      const q = num(pick(it, "delivered_qty", "invoice_qty", "qty"));
      const amount = num(pick(it, "delivered_amount", "amount")) || round2(rate * q);
      const gstPct = gstRateFor(ctx, it);
      const { taxable: t, tax: g } = backOutTax(amount, gstPct);
      taxable += t;
      tax += g;
      return {
        key: `${id}-${idx}`,
        product: pick(it, "product_name", "item_name", "item") || "-",
        productId: pick(it, "product_id", "product"),
        hsn: hsnFor(ctx, it),
        uom: pick(it, "uom_name", "unit", "uom") || "-",
        requiredQty: num(pick(it, "required_qty")),
        qty: q,
        rate,
        gstPct,
        taxable: round2(t),
        gst: round2(g),
        amount: round2(amount),
        creditedQty: num(pick(it, "credited_qty")),
        creditedAmount: num(pick(it, "credited_amount")),
      };
    });

    const debitAdj = num(pick(detail || row, "debit_adjusted_amount"));
    const headerTotal = num(pick(row, "payable_amount", "total_amount", "grand_total"));
    // Gross of the lines; the header's payable is net of the wallet adjustment.
    const lineTotal = round2(items.reduce((a, i) => a + i.amount, 0));
    const total = lineTotal || round2(headerTotal + debitAdj);

    if (!items.length) {
      // No detail loaded — value the whole invoice at the blended product rate 0.
      taxable = total;
      tax = 0;
    }

    const { cgst, sgst, igst, intra } = splitGst(tax, partyState, ctx.orgState);

    return {
      key: `SI-${id}`,
      id,
      type: VOUCHER_TYPES.SALES,
      date: pick(row, "invoice_date", "created_at"),
      voucherNo: pick(row, "sale_invoice_number", "invoice_number") || `SI-${id}`,
      refNo: pick(row, "order_number", "sales_order_number") || "-",
      party: customerName,
      partyId: pick(customer || {}, "customer_id", "id"),
      partyType: "Customer",
      partyState,
      partyGstin: pick(customer || {}, "gst_number", "gstin") || "-",
      taxable: round2(taxable),
      cgst,
      sgst,
      igst,
      gst: round2(tax),
      roundOff: 0,
      adjustment: debitAdj,
      total: round2(total),
      net: round2(total - debitAdj),
      intra,
      items,
      hasDetail: Boolean(detail),
      taxBasis: "derived",
      debitLedger: customerName,
      creditLedger: "Sales Account",
      narration: `Being goods sold vide invoice ${
        pick(row, "sale_invoice_number") || id
      }`,
      source: row,
    };
  });
};

/* ================================================================== */
/* Purchase invoices -> Purchase vouchers                              */
/* ================================================================== */

export const buildPurchaseVouchers = (list = [], ctx) =>
  list.map((row) => {
    const id = pick(row, "id", "invoice_id");
    const vendorName =
      pick(row, "supplier_name", "vendor_name", "vendor", "supplier") || "-";
    const vendor =
      ctx.vendorByName.get(String(vendorName).trim().toLowerCase()) ||
      ctx.vendorById.get(String(pick(row, "vendor", "vendor_id"))) ||
      null;
    const partyState =
      pick(vendor || {}, "state", "state_name") ||
      pick(vendor?.business_details || {}, "state") ||
      pick(row, "place", "dispatch_from") ||
      "";

    const taxable = num(pick(row, "total_taxable_amount", "taxable_amount"));
    const postedGst = num(
      pick(row, "total_igst_amount", "igst_amount", "total_gst_amount"),
    );
    const grand = num(pick(row, "grand_total", "total_amount", "invoice_amount"));

    const rawItems = row.items || row.invoice_items || [];
    const items = rawItems.map((it, idx) => {
      const lineTaxable = num(pick(it, "taxable_amount"));
      const lineGst = num(pick(it, "igst_amount", "gst_amount"));
      return {
        key: `${id}-${idx}`,
        product: pick(it, "item_name", "product_name", "product") || "-",
        productId: pick(it, "product", "product_id"),
        hsn: hsnFor(ctx, it),
        uom: pick(it, "unit", "uom_name") || "-",
        qty: num(pick(it, "invoice_qty", "qty")),
        netWeight: num(pick(it, "net_wt", "net_weight")),
        rate: num(pick(it, "rate")),
        gstPct: num(pick(it, "gst_percent", "gst_percentage")) || gstRateFor(ctx, it),
        taxable: round2(lineTaxable),
        gst: round2(lineGst),
        amount: round2(num(pick(it, "total_amount")) || lineTaxable + lineGst),
      };
    });

    // The backend posts IGST; re-split it when the vendor is in-state.
    const { cgst, sgst, igst, intra } = splitGst(postedGst, partyState, ctx.orgState);

    return {
      key: `PI-${id}`,
      id,
      type: VOUCHER_TYPES.PURCHASE,
      date: pick(row, "invoice_date", "created_at"),
      voucherNo: pick(row, "invoice_no", "invoice_number") || `PI-${id}`,
      refNo: pick(row, "lr_no", "ewaybill_no") || "-",
      party: vendorName,
      partyId: pick(vendor || {}, "id", "vendor_id"),
      partyType: "Vendor",
      partyState,
      partyGstin:
        pick(vendor?.business_details || vendor || {}, "gstin", "gst_no") || "-",
      taxable: round2(taxable),
      cgst,
      sgst,
      igst,
      gst: round2(postedGst),
      roundOff: num(pick(row, "round_off_amount")),
      total: round2(grand || taxable + postedGst),
      net: round2(grand || taxable + postedGst),
      dueDate: pick(row, "payment_due_date"),
      ewayBill: pick(row, "ewaybill_no") || "-",
      vehicleNo: pick(row, "vehicle_no") || "-",
      intra,
      items,
      hasDetail: items.length > 0,
      taxBasis: "posted",
      debitLedger: "Purchase Account",
      creditLedger: vendorName,
      narration: `Being goods purchased vide bill ${pick(row, "invoice_no") || id}`,
      source: row,
    };
  });

/* ================================================================== */
/* Sales disputes -> Credit Notes                                      */
/* ================================================================== */

export const buildCreditNotes = (disputes = [], details = [], ctx) => {
  const detailById = new Map();
  details.forEach((d) => {
    const id = pick(d, "dispute_id", "id");
    if (id !== undefined) detailById.set(String(id), d);
  });

  return disputes
    .filter((d) => {
      const s = String(pick(d, "status") || "").toLowerCase();
      return s === "approved" || s === "credited";
    })
    .map((row) => {
      const id = pick(row, "dispute_id", "id");
      const detail = detailById.get(String(id));
      const customerName = pick(row, "customer_name", "customer") || "-";
      const customer =
        ctx.customerByName.get(String(customerName).trim().toLowerCase()) || null;
      const partyState = pick(customer || {}, "state", "state_name") || "";

      const rawItems = detail?.items || row.items || [];
      let taxable = 0;
      let tax = 0;
      const items = (Array.isArray(rawItems) ? rawItems : [])
        .filter((it) => typeof it === "object")
        .map((it, idx) => {
          const rate = num(pick(it, "rate"));
          const q = num(pick(it, "return_qty"));
          const amount = round2(rate * q);
          const gstPct = gstRateFor(ctx, it);
          const { taxable: t, tax: g } = backOutTax(amount, gstPct);
          taxable += t;
          tax += g;
          return {
            key: `${id}-${idx}`,
            product: pick(it, "item", "product_name") || "-",
            // Needed so Stock Movement matches returns to the same item bucket
            // as purchases and sales.
            productId: pick(it, "product_id", "product"),
            hsn: hsnFor(ctx, it),
            itemCode: pick(it, "item_code") || "-",
            uom: pick(it, "uom_name") || "-",
            orderQty: num(pick(it, "order_qty")),
            deliveredQty: num(pick(it, "delivered_qty")),
            qty: q,
            rate,
            gstPct,
            taxable: round2(t),
            gst: round2(g),
            amount,
            reason: pick(it, "reason", "other_reason") || "-",
          };
        });

      const total = round2(items.reduce((a, i) => a + i.amount, 0));
      const { cgst, sgst, igst, intra } = splitGst(tax, partyState, ctx.orgState);

      return {
        key: `CN-${id}`,
        id,
        type: VOUCHER_TYPES.CREDIT_NOTE,
        date: pick(row, "return_date", "date", "created_at"),
        voucherNo: pick(row, "dispute_no", "dispute_number") || `CN-${id}`,
        refNo: pick(row, "sale_invoice_number", "invoice_no") || "-",
        party: customerName,
        partyId: pick(customer || {}, "customer_id", "id"),
        partyType: "Customer",
        partyState,
        taxable: round2(taxable),
        cgst,
        sgst,
        igst,
        gst: round2(tax),
        total,
        net: total,
        intra,
        items,
        hasDetail: Boolean(detail),
        taxBasis: "derived",
        debitLedger: "Sales Return Account",
        creditLedger: customerName,
        narration: `Being credit note for return against invoice ${
          pick(row, "sale_invoice_number") || "-"
        }`,
        status: pick(row, "status"),
        source: row,
      };
    });
};

/* ================================================================== */
/* Freight -> Receipts (recoveries) and Payments                       */
/* ================================================================== */

/**
 * Freight rows carry the only money the business recovers from and pays to
 * transporters. Shortage claims are recoveries (receipt side); advances,
 * other charges and balance settlements are payments.
 */
export const buildFreightVouchers = (freight = []) =>
  freight.map((row, idx) => {
    const id = pick(row, "id", "freight_id") ?? idx;
    const freightAmount = num(pick(row, "freight_amount"));
    const claim = num(pick(row, "claim_shortage"));
    const other = num(pick(row, "other_charges"));
    const advance = num(pick(row, "advance_paid_amount"));
    const commission = num(pick(row, "transport_commission"));
    const balancePayable = num(pick(row, "balance_payable"));
    const balancePaid = num(pick(row, "balance_paid"));

    return {
      key: `FR-${id}`,
      id,
      type: VOUCHER_TYPES.FREIGHT,
      date: pick(row, "lorry_receipt_date", "created_at"),
      voucherNo: pick(row, "lorry_receipt_no", "lr_no") || `LR-${id}`,
      refNo: pick(row, "purchase_order_number") || "-",
      party: pick(row, "transporter_name", "transporter") || "-",
      partyType: "Transporter",
      vehicle: pick(row, "vehicle_details", "vehicle_no") || "-",
      freightRateAgreed: num(pick(row, "freight_rate_agreed")),
      freightRatePlaced: num(pick(row, "freight_rate_placed")),
      grossWeight: num(pick(row, "gross_weight_loaded")),
      freightAmount,
      advance,
      commission,
      claim,
      claimNotes: pick(row, "claim_shortage_notes") || "",
      other,
      otherNotes: pick(row, "other_charges_notes") || "",
      balancePayable,
      balancePaid,
      // Receipt side = money recovered from the transporter.
      receipt: round2(claim),
      // Payment side = money going out.
      payment: round2(advance + balancePaid),
      taxable: round2(freightAmount),
      gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: round2(freightAmount),
      net: round2(freightAmount - claim + other),
      taxBasis: "posted",
      debitLedger: "Freight & Carriage Inward",
      creditLedger: pick(row, "transporter_name") || "Transporter",
      narration: `Freight against LR ${pick(row, "lorry_receipt_no") || id}`,
      source: row,
    };
  });

/* ================================================================== */
/* Wallet -> Receipts                                                  */
/* ================================================================== */

const RECEIPT_TYPES = new Set(["PAYMENT", "CREDIT"]);

/**
 * Wallet DEBIT / DEBIT_USAGE entries are ambiguous in the source system: the
 * UI button says "Deduct" while the success message says "Credit added", and
 * the endpoint carries no direction flag. Until the backend confirms their
 * meaning, they are shown in the ledger as MEMO rows (no debit, no credit) so
 * they stay visible without silently moving a customer's outstanding.
 *
 * If they are confirmed to genuinely increase what the customer owes, flip
 * this to true — the Customer Ledger and Receivables both read it, so the two
 * reports cannot drift apart.
 */
export const WALLET_DEBIT_AFFECTS_BALANCE = false;

/**
 * @param {object[]} ledgers [{ customerId, rows: [] }]
 */
export const buildWalletVouchers = (ledgers = [], ctx) => {
  const out = [];
  ledgers.forEach(({ customerId, rows }) => {
    const customer = ctx.customerById.get(String(customerId));
    const name =
      pick(customer || {}, "business_name", "customer_name", "name") ||
      `Customer ${customerId}`;
    (rows || []).forEach((r, idx) => {
      const t = String(pick(r, "type", "source_type") || "").toUpperCase();
      const amount = num(pick(r, "amount"));
      if (!amount) return;
      const isReceipt = RECEIPT_TYPES.has(t);
      out.push({
        key: `WL-${customerId}-${idx}`,
        id: `${customerId}-${idx}`,
        type: isReceipt ? VOUCHER_TYPES.RECEIPT : VOUCHER_TYPES.PAYMENT,
        entryType: t || "ENTRY",
        date: pick(r, "created_at", "date"),
        voucherNo: pick(r, "reference", "voucher_no") || `WL/${customerId}/${idx + 1}`,
        party: name,
        partyId: customerId,
        partyType: "Customer",
        amount: round2(amount),
        receipt: isReceipt ? round2(amount) : 0,
        payment: isReceipt ? 0 : round2(amount),
        creditBalance: num(pick(r, "credit_balance")),
        debitBalance: num(pick(r, "debit_balance")),
        taxable: 0,
        gst: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: round2(amount),
        net: round2(amount),
        taxBasis: "posted",
        debitLedger: isReceipt ? "Cash / Bank" : name,
        creditLedger: isReceipt ? name : "Cash / Bank",
        narration: pick(r, "remarks", "narration") || "-",
        source: r,
      });
    });
  });
  return out;
};

/* ================================================================== */
/* Day Book                                                            */
/* ================================================================== */

/** Merge every voucher stream into one date-ordered day book. */
export const buildDayBook = (streams = []) => {
  const all = streams.flat().filter(Boolean);
  return all
    .map((v) => {
      // Tally's day book shows the two ledgers touched and the amount.
      let debit = 0;
      let credit = 0;
      switch (v.type) {
        case VOUCHER_TYPES.SALES:
          // Party is debited, Sales (and GST output) credited.
          debit = v.net ?? v.total;
          credit = v.net ?? v.total;
          break;
        case VOUCHER_TYPES.PURCHASE:
          debit = v.total;
          credit = v.total;
          break;
        case VOUCHER_TYPES.CREDIT_NOTE:
          debit = v.total;
          credit = v.total;
          break;
        case VOUCHER_TYPES.RECEIPT:
          debit = v.amount ?? v.receipt;
          credit = v.amount ?? v.receipt;
          break;
        case VOUCHER_TYPES.PAYMENT:
          debit = v.amount ?? v.payment;
          credit = v.amount ?? v.payment;
          break;
        case VOUCHER_TYPES.FREIGHT:
          debit = v.total;
          credit = v.total;
          break;
        default:
          debit = v.total || 0;
          credit = v.total || 0;
      }
      return { ...v, debit: round2(debit), credit: round2(credit) };
    })
    .sort((a, b) => {
      const da = toDate(a.date);
      const db = toDate(b.date);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.valueOf() - db.valueOf();
    });
};

/* ================================================================== */
/* Period filtering + month grouping                                   */
/* ================================================================== */

export const inPeriod = (row, range) => {
  if (!range || !range[0] || !range[1]) return true;
  const d = toDate(row.date);
  if (!d) return false;
  return (
    d.valueOf() >= range[0].startOf("day").valueOf() &&
    d.valueOf() <= range[1].endOf("day").valueOf()
  );
};

export const filterPeriod = (rows = [], range) => rows.filter((r) => inPeriod(r, range));

/** Month-wise summary rows, the way Tally opens a Sales/Purchase Register. */
export const groupByMonth = (rows = [], fields = ["taxable", "gst", "total"]) => {
  const map = new Map();
  rows.forEach((r) => {
    const k = monthKey(r.date);
    if (!k) return;
    if (!map.has(k)) {
      map.set(k, { month: k, count: 0, rows: [], ...Object.fromEntries(fields.map((f) => [f, 0])) });
    }
    const bucket = map.get(k);
    bucket.count += 1;
    bucket.rows.push(r);
    fields.forEach((f) => {
      bucket[f] = round2(bucket[f] + num(r[f]));
    });
  });
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
};

/* ================================================================== */
/* Customer ledger                                                     */
/* ================================================================== */

/**
 * Tally-style party ledger: invoices debit the party, receipts and credit
 * notes credit it, with a running balance.
 *
 * Opening balance is zero — the DMS has no opening-balance master, so the
 * ledger opens from the first transaction in the system.
 */
export const buildCustomerLedger = ({
  customerName,
  salesVouchers = [],
  creditNotes = [],
  walletVouchers = [],
  salesOrders = [],
  range,
}) => {
  const matches = (v) =>
    String(v.party || "").trim().toLowerCase() ===
    String(customerName || "").trim().toLowerCase();

  const entries = [];

  salesVouchers.filter(matches).forEach((v) => {
    entries.push({
      key: v.key,
      date: v.date,
      particulars: "Sales",
      vchType: "Sales",
      vchNo: v.voucherNo,
      ref: v.refNo,
      debit: round2(v.total),
      credit: 0,
      voucher: v,
    });
    if (num(v.adjustment) > 0) {
      entries.push({
        key: `${v.key}-adj`,
        date: v.date,
        particulars: "Wallet adjustment against invoice",
        vchType: "Adjustment",
        vchNo: v.voucherNo,
        ref: v.refNo,
        debit: 0,
        credit: round2(v.adjustment),
        voucher: v,
      });
    }
  });

  creditNotes.filter(matches).forEach((v) => {
    entries.push({
      key: v.key,
      date: v.date,
      particulars: "Sales Return",
      vchType: "Credit Note",
      vchNo: v.voucherNo,
      ref: v.refNo,
      debit: 0,
      credit: round2(v.total),
      voucher: v,
    });
  });

  walletVouchers.filter(matches).forEach((v) => {
    const isReceipt = v.type === VOUCHER_TYPES.RECEIPT;
    const countsAsDebit = !isReceipt && WALLET_DEBIT_AFFECTS_BALANCE;
    entries.push({
      key: v.key,
      date: v.date,
      particulars: v.narration !== "-" ? v.narration : v.entryType,
      vchType: isReceipt ? "Receipt" : "Debit Note",
      vchNo: v.voucherNo,
      ref: "-",
      debit: countsAsDebit ? round2(v.amount) : 0,
      credit: isReceipt ? round2(v.amount) : 0,
      // A memo row is shown but does not move the running balance.
      memo: !isReceipt && !WALLET_DEBIT_AFFECTS_BALANCE,
      memoAmount: isReceipt ? 0 : round2(v.amount),
      voucher: v,
    });
  });

  const ordered = entries
    .filter((e) => inPeriod(e, range))
    .sort((a, b) => {
      const da = toDate(a.date);
      const db = toDate(b.date);
      if (!da || !db) return 0;
      return da.valueOf() - db.valueOf();
    });

  let running = 0;
  const withBalance = ordered.map((e) => {
    running = round2(running + num(e.debit) - num(e.credit));
    return { ...e, balance: running };
  });

  const pendingOrders = salesOrders.filter(
    (o) =>
      String(
        pick(o, "customer_name") || pick(o.customer || {}, "name") || "",
      )
        .trim()
        .toLowerCase() === String(customerName || "").trim().toLowerCase(),
  );

  return {
    entries: withBalance,
    totalDebit: sumBy(withBalance, "debit"),
    totalCredit: sumBy(withBalance, "credit"),
    closing: running,
    pendingOrders,
  };
};

/* ================================================================== */
/* Receivables + ageing                                                */
/* ================================================================== */

/**
 * The DMS has no bill-by-bill allocation, so receipts and credit notes are
 * applied oldest-invoice-first (FIFO), which is Tally's own default when a
 * receipt carries no "against reference".
 */
export const buildReceivables = ({
  salesVouchers = [],
  creditNotes = [],
  walletVouchers = [],
  customers = [],
  asOn,
  buckets = [30, 60, 90],
}) => {
  const creditDaysFor = (name) => {
    const c = customers.find(
      (x) =>
        String(
          pick(x, "business_name", "customer_name", "name") || "",
        )
          .trim()
          .toLowerCase() === String(name || "").trim().toLowerCase(),
    );
    return {
      days: num(pick(c || {}, "days_limit")) || 0,
      limit: num(pick(c || {}, "amount_limit")) || 0,
      gstin: pick(c || {}, "gst_number", "gstin") || "-",
      id: pick(c || {}, "customer_id", "id"),
    };
  };

  const byParty = new Map();
  salesVouchers.forEach((v) => {
    const k = String(v.party || "-").trim();
    if (!byParty.has(k)) byParty.set(k, { bills: [], credits: 0 });
    byParty.get(k).bills.push({
      key: v.key,
      date: v.date,
      voucherNo: v.voucherNo,
      amount: round2(v.total),
      outstanding: round2(v.total),
      voucher: v,
    });
  });

  const addCredit = (party, amt) => {
    const k = String(party || "-").trim();
    if (!byParty.has(k)) byParty.set(k, { bills: [], credits: 0 });
    byParty.get(k).credits = round2(byParty.get(k).credits + num(amt));
  };
  creditNotes.forEach((v) => addCredit(v.party, v.total));
  walletVouchers.forEach((v) => {
    if (v.type === VOUCHER_TYPES.RECEIPT) {
      addCredit(v.party, v.amount);
    } else if (WALLET_DEBIT_AFFECTS_BALANCE) {
      // Same switch the Customer Ledger reads, so the two always agree.
      addCredit(v.party, -num(v.amount));
    }
  });
  salesVouchers.forEach((v) => {
    if (num(v.adjustment) > 0) addCredit(v.party, v.adjustment);
  });

  const today = asOn || toDate(new Date());
  const rows = [];

  byParty.forEach((data, party) => {
    const bills = data.bills.sort((a, b) => {
      const da = toDate(a.date);
      const db = toDate(b.date);
      if (!da || !db) return 0;
      return da.valueOf() - db.valueOf();
    });

    // FIFO-apply credits to the oldest bills.
    let pool = data.credits;
    bills.forEach((b) => {
      if (pool <= 0) return;
      const applied = Math.min(pool, b.outstanding);
      b.outstanding = round2(b.outstanding - applied);
      b.applied = round2(applied);
      pool = round2(pool - applied);
    });

    const meta = creditDaysFor(party);
    const open = bills.filter((b) => b.outstanding > 0.005);
    const bucketTotals = { b0: 0, b1: 0, b2: 0, b3: 0 };

    open.forEach((b) => {
      const d = toDate(b.date);
      const dueFrom = d ? d.add(meta.days, "day") : null;
      const overdue = dueFrom && today ? today.diff(dueFrom, "day") : 0;
      b.ageDays = d && today ? today.diff(d, "day") : 0;
      b.overdueDays = Math.max(0, overdue);
      if (b.ageDays <= buckets[0]) bucketTotals.b0 += b.outstanding;
      else if (b.ageDays <= buckets[1]) bucketTotals.b1 += b.outstanding;
      else if (b.ageDays <= buckets[2]) bucketTotals.b2 += b.outstanding;
      else bucketTotals.b3 += b.outstanding;
    });

    const outstanding = round2(open.reduce((a, b) => a + b.outstanding, 0));
    rows.push({
      key: party,
      party,
      customerId: meta.id,
      gstin: meta.gstin,
      creditDays: meta.days,
      creditLimit: meta.limit,
      billed: round2(bills.reduce((a, b) => a + b.amount, 0)),
      received: round2(data.credits),
      unapplied: round2(pool),
      outstanding,
      billCount: open.length,
      overLimit: meta.limit > 0 && outstanding > meta.limit,
      b0: round2(bucketTotals.b0),
      b1: round2(bucketTotals.b1),
      b2: round2(bucketTotals.b2),
      b3: round2(bucketTotals.b3),
      bills: open,
      allBills: bills,
    });
  });

  return rows.sort((a, b) => b.outstanding - a.outstanding);
};

/* ================================================================== */
/* Stock                                                               */
/* ================================================================== */

/**
 * Closing stock valued at the LAST PURCHASE RATE for each item — a standard
 * Tally valuation method and the only one this data supports, since the
 * system stores no cost layers.
 */
export const buildStockSummary = ({
  inventory = [],
  purchaseVouchers = [],
  products = [],
}) => {
  // Latest purchase rate per product.
  const rateByProduct = new Map();
  const rateByName = new Map();
  const ordered = [...purchaseVouchers].sort((a, b) => {
    const da = toDate(a.date);
    const db = toDate(b.date);
    return (da?.valueOf() || 0) - (db?.valueOf() || 0);
  });
  ordered.forEach((v) => {
    (v.items || []).forEach((it) => {
      const r = num(it.rate);
      if (r <= 0) return;
      if (it.productId !== undefined && it.productId !== null) {
        rateByProduct.set(String(it.productId), { rate: r, date: v.date, vch: v.voucherNo });
      }
      if (it.product) {
        rateByName.set(String(it.product).trim().toLowerCase(), {
          rate: r,
          date: v.date,
          vch: v.voucherNo,
        });
      }
    });
  });

  const invByProduct = new Map();
  inventory.forEach((i) => {
    const pid = pick(i, "product", "product_id");
    if (pid !== undefined) invByProduct.set(String(pid), i);
  });

  const rows = products.map((p) => {
    const pid = String(pick(p, "id", "product_id"));
    const inv = invByProduct.get(pid);
    const name = pick(p, "name", "product_name") || "-";
    const stock = num(
      pick(inv || {}, "current_stock") ?? pick(p, "current_stock"),
    );
    const found =
      rateByProduct.get(pid) || rateByName.get(String(name).trim().toLowerCase());
    const mrp = num(pick(inv || {}, "mrp"));
    const rate = found?.rate || 0;
    const rateSource = found ? "Last purchase" : mrp ? "MRP (no purchase rate)" : "Not valued";
    const useRate = found?.rate || mrp || 0;

    return {
      key: pid,
      productId: pid,
      product: name,
      group: pick(p, "product_group_name", "product_group") || "-",
      hsn: pick(p, "hsn_code", "hsn") || pick(inv || {}, "hsn_code") || "-",
      uom: pick(p, "base_unit_name", "base_unit", "uom") || "-",
      gstPct: num(pick(p, "gst_percentage")),
      closingQty: stock,
      minStock: num(pick(inv || {}, "minimum_stock_balance")),
      rate: useRate,
      rateSource,
      lastPurchaseRate: rate,
      lastPurchaseVch: found?.vch || "-",
      mrp,
      value: round2(stock * useRate),
      belowMin:
        num(pick(inv || {}, "minimum_stock_balance")) > 0 &&
        stock < num(pick(inv || {}, "minimum_stock_balance")),
    };
  });

  return rows.filter((r) => r.closingQty !== 0 || r.value !== 0 || r.rate > 0);
};

/**
 * Inward / outward movement per item.
 * Inward  = purchase invoice quantities and stock-in-transit receipts.
 * Outward = sales invoice delivered quantities, less returns.
 * Opening is back-calculated from the current closing stock.
 */
export const buildStockMovement = ({
  purchaseVouchers = [],
  salesVouchers = [],
  creditNotes = [],
  stockSummary = [],
  range,
}) => {
  const map = new Map();

  const touch = (key, name) => {
    if (!map.has(key)) {
      map.set(key, {
        key,
        product: name,
        inwardQty: 0,
        inwardValue: 0,
        outwardQty: 0,
        outwardValue: 0,
        returnQty: 0,
        returnValue: 0,
        movements: [],
      });
    }
    return map.get(key);
  };

  // Documents don't all carry a product id (dispute lines often don't), so
  // build a name -> id map first and resolve every line through it. Without
  // this, a return lands in a different bucket from the sale it reverses.
  const nameToId = new Map();
  [purchaseVouchers, salesVouchers, creditNotes].forEach((stream) =>
    stream.forEach((v) =>
      (v.items || []).forEach((it) => {
        const n = String(it.product || "").trim().toLowerCase();
        if (n && it.productId !== undefined && it.productId !== null) {
          nameToId.set(n, String(it.productId));
        }
      }),
    ),
  );

  const keyFor = (it) => {
    if (it.productId !== undefined && it.productId !== null) {
      return String(it.productId);
    }
    const n = String(it.product || "-").trim().toLowerCase();
    return nameToId.get(n) || n;
  };

  filterPeriod(purchaseVouchers, range).forEach((v) => {
    (v.items || []).forEach((it) => {
      const b = touch(keyFor(it), it.product);
      b.inwardQty = round2(b.inwardQty + num(it.qty));
      b.inwardValue = round2(b.inwardValue + num(it.taxable || it.amount));
      b.movements.push({
        key: `${v.key}-${it.key}`,
        date: v.date,
        vchType: "Purchase",
        vchNo: v.voucherNo,
        party: v.party,
        inQty: num(it.qty),
        outQty: 0,
        rate: num(it.rate),
        value: num(it.taxable || it.amount),
        voucher: v,
      });
    });
  });

  filterPeriod(salesVouchers, range).forEach((v) => {
    (v.items || []).forEach((it) => {
      const b = touch(keyFor(it), it.product);
      b.outwardQty = round2(b.outwardQty + num(it.qty));
      b.outwardValue = round2(b.outwardValue + num(it.taxable || it.amount));
      b.movements.push({
        key: `${v.key}-${it.key}`,
        date: v.date,
        vchType: "Sales",
        vchNo: v.voucherNo,
        party: v.party,
        inQty: 0,
        outQty: num(it.qty),
        rate: num(it.rate),
        value: num(it.taxable || it.amount),
        voucher: v,
      });
    });
  });

  filterPeriod(creditNotes, range).forEach((v) => {
    (v.items || []).forEach((it) => {
      const b = touch(keyFor(it), it.product);
      b.returnQty = round2(b.returnQty + num(it.qty));
      b.returnValue = round2(b.returnValue + num(it.taxable || it.amount));
      b.movements.push({
        key: `${v.key}-${it.key}`,
        date: v.date,
        vchType: "Credit Note",
        vchNo: v.voucherNo,
        party: v.party,
        inQty: num(it.qty),
        outQty: 0,
        rate: num(it.rate),
        value: num(it.taxable || it.amount),
        voucher: v,
      });
    });
  });

  const closingByKey = new Map();
  stockSummary.forEach((s) => {
    closingByKey.set(String(s.productId), s);
    closingByKey.set(String(s.product).trim().toLowerCase(), s);
  });

  return Array.from(map.values())
    .map((b) => {
      const summary = closingByKey.get(b.key) || null;
      const closingQty = summary ? summary.closingQty : null;
      const netIn = round2(b.inwardQty + b.returnQty - b.outwardQty);
      // Closing is known; opening is derived by reversing the period's movement.
      const openingQty = closingQty === null ? null : round2(closingQty - netIn);
      const rate = summary?.rate || 0;
      return {
        ...b,
        product: summary?.product || b.product,
        uom: summary?.uom || "-",
        hsn: summary?.hsn || "-",
        openingQty,
        openingValue: openingQty === null ? null : round2(openingQty * rate),
        closingQty,
        closingValue: closingQty === null ? null : round2(closingQty * rate),
        netQty: netIn,
        rate,
        movements: b.movements.sort((x, y) => {
          const dx = toDate(x.date);
          const dy = toDate(y.date);
          return (dx?.valueOf() || 0) - (dy?.valueOf() || 0);
        }),
      };
    })
    .sort((a, b) => b.outwardValue - a.outwardValue);
};

/* ================================================================== */
/* GST summary                                                         */
/* ================================================================== */

export const buildGstSummary = ({ salesVouchers = [], purchaseVouchers = [], range }) => {
  const sales = filterPeriod(salesVouchers, range);
  const purchases = filterPeriod(purchaseVouchers, range);

  const outward = {
    taxable: sumBy(sales, "taxable"),
    cgst: sumBy(sales, "cgst"),
    sgst: sumBy(sales, "sgst"),
    igst: sumBy(sales, "igst"),
    total: sumBy(sales, "total"),
    count: sales.length,
  };
  outward.tax = round2(outward.cgst + outward.sgst + outward.igst);

  const inward = {
    taxable: sumBy(purchases, "taxable"),
    cgst: sumBy(purchases, "cgst"),
    sgst: sumBy(purchases, "sgst"),
    igst: sumBy(purchases, "igst"),
    total: sumBy(purchases, "total"),
    count: purchases.length,
  };
  inward.tax = round2(inward.cgst + inward.sgst + inward.igst);

  const net = {
    cgst: round2(outward.cgst - inward.cgst),
    sgst: round2(outward.sgst - inward.sgst),
    igst: round2(outward.igst - inward.igst),
  };
  net.total = round2(net.cgst + net.sgst + net.igst);

  // HSN-wise, the way GSTR-1 wants it.
  const hsnMap = new Map();
  const addHsn = (bucket, v) => {
    (v.items || []).forEach((it) => {
      const code = it.hsn || "-";
      const k = `${bucket}|${code}`;
      if (!hsnMap.has(k)) {
        hsnMap.set(k, {
          key: k,
          direction: bucket,
          hsn: code,
          uom: it.uom || "-",
          qty: 0,
          taxable: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: 0,
        });
      }
      const row = hsnMap.get(k);
      const lineTaxable = num(it.taxable);
      const lineGst = num(it.gst);
      const share = v.gst > 0 ? lineGst / v.gst : 0;
      row.qty = round2(row.qty + num(it.qty));
      row.taxable = round2(row.taxable + lineTaxable);
      row.cgst = round2(row.cgst + num(v.cgst) * share);
      row.sgst = round2(row.sgst + num(v.sgst) * share);
      row.igst = round2(row.igst + num(v.igst) * share);
      row.total = round2(row.taxable + row.cgst + row.sgst + row.igst);
    });
  };
  sales.forEach((v) => addHsn("Outward", v));
  purchases.forEach((v) => addHsn("Inward", v));

  // Rate-wise slabs.
  const rateMap = new Map();
  const addRate = (bucket, v) => {
    (v.items || []).forEach((it) => {
      const r = num(it.gstPct);
      const k = `${bucket}|${r}`;
      if (!rateMap.has(k)) {
        rateMap.set(k, { key: k, direction: bucket, rate: r, taxable: 0, tax: 0 });
      }
      const row = rateMap.get(k);
      row.taxable = round2(row.taxable + num(it.taxable));
      row.tax = round2(row.tax + num(it.gst));
    });
  };
  sales.forEach((v) => addRate("Outward", v));
  purchases.forEach((v) => addRate("Inward", v));

  // B2B vs B2C, by whether the party has a GSTIN.
  const b2b = sales.filter((v) => v.partyGstin && v.partyGstin !== "-");
  const b2c = sales.filter((v) => !v.partyGstin || v.partyGstin === "-");

  return {
    outward,
    inward,
    net,
    hsn: Array.from(hsnMap.values()).sort(
      (a, b) => a.direction.localeCompare(b.direction) || b.taxable - a.taxable,
    ),
    rates: Array.from(rateMap.values()).sort(
      (a, b) => a.direction.localeCompare(b.direction) || a.rate - b.rate,
    ),
    b2b: { count: b2b.length, taxable: sumBy(b2b, "taxable"), tax: sumBy(b2b, "gst") },
    b2c: { count: b2c.length, taxable: sumBy(b2c, "taxable"), tax: sumBy(b2c, "gst") },
    sales,
    purchases,
  };
};

/* ================================================================== */
/* Broker commission                                                   */
/* ================================================================== */

/**
 * Applies each broker's configured commission_setups to the sales contracts
 * booked through that broker. Commission is computed, not stored — the system
 * records the rule and the contract, never the payable.
 */
export const buildBrokerCommission = ({ brokers = [], salesContracts = [], range }) => {
  const contractsInRange = salesContracts.filter((c) =>
    inPeriod({ date: pick(c, "created_date", "from_date", "created_at") }, range),
  );

  return brokers.map((b) => {
    const brokerId = String(pick(b, "id", "broker_id"));
    const brokerName =
      pick(b, "name", "broker_name", "registered_name", "full_name") || "-";

    const own = contractsInRange.filter((c) => {
      const cid = pick(c, "broker_id", "broker");
      const cname = pick(c, "broker_name");
      return (
        (cid !== undefined && String(cid) === brokerId) ||
        (cname &&
          String(cname).trim().toLowerCase() ===
            String(brokerName).trim().toLowerCase())
      );
    });

    const setups = Array.isArray(b.commission_setups) ? b.commission_setups : [];

    const lines = own.map((c) => {
      const value = num(pick(c, "total_amount", "grand_total"));
      const qtyTon = num(pick(c, "total_net_weight", "total_qty"));
      const items = Array.isArray(c.items) ? c.items : [];

      // Prefer a setup matching one of the contract's products.
      const productIds = items.map((i) => String(pick(i, "product_id", "product")));
      const setup =
        setups.find(
          (s) => s.on_sale !== false && productIds.includes(String(s.product)),
        ) ||
        setups.find((s) => s.on_sale !== false) ||
        null;

      let commission = 0;
      let basis = "No commission rule configured";
      if (setup) {
        const amt = num(setup.commission_amount);
        const type = String(setup.commission_type || "").toLowerCase();
        const method = String(setup.commission_method || "").toLowerCase();
        if (type.includes("percent")) {
          commission = round2((value * amt) / 100);
          basis = `${amt}% on contract value`;
        } else if (method.includes("perunit") || method.includes("per_unit")) {
          commission = round2(amt * qtyTon);
          basis = `₹${amt} per unit x ${qtyTon}`;
        } else if (method.includes("pertransaction") || method.includes("per_transaction")) {
          commission = round2(amt);
          basis = `₹${amt} per transaction`;
        } else {
          commission = round2(amt);
          basis = `Fixed ₹${amt}`;
        }
      }

      return {
        key: `${brokerId}-${pick(c, "sale_contract_id", "id")}`,
        contractNo: pick(c, "sale_contract_number", "contract_number") || "-",
        date: pick(c, "created_date", "from_date"),
        customer: pick(c, "customer_business_name", "customer_name") || "-",
        plant: pick(c, "plant_name") || "-",
        contractValue: value,
        qty: qtyTon,
        basis,
        commission,
        status: pick(c, "status") || "-",
      };
    });

    return {
      key: brokerId,
      brokerId,
      broker: brokerName,
      gstin: pick(b, "gstin") || "-",
      pan: pick(b, "pan") || "-",
      state: pick(b, "permanent_state", "state") || "-",
      setupCount: setups.length,
      setups,
      contracts: lines.length,
      contractValue: round2(lines.reduce((a, l) => a + l.contractValue, 0)),
      commission: round2(lines.reduce((a, l) => a + l.commission, 0)),
      lines,
    };
  });
};

/* ================================================================== */
/* Cash & Bank book                                                    */
/* ================================================================== */

/**
 * Built from the two money-movement sources the system actually has:
 *   - Bank transactions captured in the Wealth module (DEPOSIT / WITHDRAWAL / OD)
 *   - Customer wallet receipts
 * There is no opening bank balance in the system, so the book opens at nil
 * and shows the movement, not the true bank position.
 */
export const buildCashBankBook = ({ bankEntries = [], walletVouchers = [], range }) => {
  const rows = [];

  bankEntries.forEach((e, idx) => {
    const type = String(pick(e, "transaction_type", "type") || "").toUpperCase();
    const amount = num(pick(e, "amount"));
    const isIn = type === "DEPOSIT";
    rows.push({
      key: `BK-${pick(e, "id") ?? idx}`,
      date: pick(e, "transaction_date", "date", "created_at"),
      account:
        [pick(e, "bank_name"), pick(e, "bank_account_no")].filter(Boolean).join(" / ") ||
        "Bank",
      particulars: pick(e, "narration", "remarks") || type || "-",
      vchType: isIn ? "Receipt" : type === "OD" ? "Contra (OD)" : "Payment",
      ref: pick(e, "cheque_ref", "reference") || "-",
      receipt: isIn ? round2(amount) : 0,
      payment: isIn ? 0 : round2(amount),
      sourceName: "Bank transactions",
      source: e,
    });
  });

  walletVouchers.forEach((v) => {
    rows.push({
      key: `WB-${v.key}`,
      date: v.date,
      account: "Customer collections",
      particulars: `${v.party} — ${v.narration !== "-" ? v.narration : v.entryType}`,
      vchType: v.type,
      ref: v.voucherNo,
      receipt: round2(v.receipt),
      payment: round2(v.payment),
      sourceName: "Customer wallet",
      source: v.source,
    });
  });

  const filtered = filterPeriod(rows, range).sort((a, b) => {
    const da = toDate(a.date);
    const db = toDate(b.date);
    return (da?.valueOf() || 0) - (db?.valueOf() || 0);
  });

  let running = 0;
  const withBalance = filtered.map((r) => {
    running = round2(running + num(r.receipt) - num(r.payment));
    return { ...r, balance: running };
  });

  return {
    rows: withBalance,
    totalReceipts: sumBy(withBalance, "receipt"),
    totalPayments: sumBy(withBalance, "payment"),
    closing: running,
  };
};

/* ================================================================== */
/* Derived statement of financial position                             */
/* ================================================================== */

/**
 * A Balance Sheet assembled from trading data only.
 *
 * IMPORTANT, and surfaced in the UI: this is NOT a general-ledger balance
 * sheet. The DMS records no capital, loans, vendor payments or expenses other
 * than freight, so the two sides are made to agree by a single residual line
 * ("Capital & Reserves (derived residual)"). Treat it as a working-capital
 * position, not a statutory balance sheet.
 */
export const buildBalanceSheet = ({
  receivables = [],
  purchaseVouchers = [],
  stockSummary = [],
  assets = [],
  depreciation = [],
  disposals = [],
  freightVouchers = [],
  gst,
  cashBank,
  brokerRows = [],
  range,
}) => {
  const sundryDebtors = round2(receivables.reduce((a, r) => a + num(r.outstanding), 0));
  const closingStock = round2(stockSummary.reduce((a, r) => a + num(r.value), 0));

  const grossAssets = round2(
    assets.reduce((a, r) => a + num(pick(r, "cost_price", "purchase_value")), 0),
  );
  const accumulatedDep = round2(
    depreciation.reduce(
      (a, r) =>
        a +
        Math.max(
          0,
          num(pick(r, "purchase_value")) - num(pick(r, "current_value")),
        ),
      0,
    ),
  );
  const netFixedAssets = round2(
    assets.reduce(
      (a, r) => a + num(pick(r, "current_value", "cost_price")),
      0,
    ),
  );
  const disposalProceeds = round2(
    disposals.reduce((a, r) => a + num(pick(r, "sale_value")), 0),
  );

  const bankBalance = round2(cashBank?.closing || 0);

  // No vendor payments are recorded anywhere, so every purchase bill is open.
  const purchasesInRange = filterPeriod(purchaseVouchers, range);
  const sundryCreditors = round2(
    purchasesInRange.reduce((a, v) => a + num(v.total), 0),
  );
  const transporterPayable = round2(
    filterPeriod(freightVouchers, range).reduce(
      (a, v) => a + num(v.balancePayable),
      0,
    ),
  );
  const brokerPayable = round2(brokerRows.reduce((a, b) => a + num(b.commission), 0));
  const gstPayable = round2(Math.max(0, gst?.net?.total || 0));
  const gstCredit = round2(Math.max(0, -(gst?.net?.total || 0)));

  const assetLines = [
    { key: "fa", particulars: "Fixed Assets (net of depreciation)", amount: netFixedAssets, note: "Asset register current value" },
    { key: "stock", particulars: "Closing Stock", amount: closingStock, note: "Valued at last purchase rate" },
    { key: "debtors", particulars: "Sundry Debtors", amount: sundryDebtors, note: "Open sales invoices after receipts" },
    { key: "bank", particulars: "Cash & Bank (movement only)", amount: bankBalance > 0 ? bankBalance : 0, note: "No opening bank balance in system" },
    { key: "itc", particulars: "GST Input Credit (net)", amount: gstCredit, note: "Where input exceeds output" },
  ].filter((l) => l.amount !== 0);

  const liabilityLines = [
    { key: "creditors", particulars: "Sundry Creditors", amount: sundryCreditors, note: "All purchase bills — no vendor payments recorded" },
    { key: "transport", particulars: "Transporter Payable", amount: transporterPayable, note: "Freight balance payable" },
    { key: "broker", particulars: "Broker Commission Payable", amount: brokerPayable, note: "Computed from commission rules" },
    { key: "gst", particulars: "GST Payable (net)", amount: gstPayable, note: "Output tax less input tax" },
    { key: "od", particulars: "Bank Overdraft", amount: bankBalance < 0 ? round2(-bankBalance) : 0, note: "Negative cash movement" },
  ].filter((l) => l.amount !== 0);

  const totalAssets = round2(assetLines.reduce((a, l) => a + l.amount, 0));
  const totalKnownLiabilities = round2(liabilityLines.reduce((a, l) => a + l.amount, 0));
  const residual = round2(totalAssets - totalKnownLiabilities);

  const fullLiabilities = [
    {
      key: "residual",
      particulars: "Capital & Reserves (derived residual)",
      amount: residual,
      note: "Balancing figure — the DMS holds no capital or ledger balances",
      isResidual: true,
    },
    ...liabilityLines,
  ];

  return {
    assetLines,
    liabilityLines: fullLiabilities,
    totalAssets,
    totalLiabilities: round2(totalKnownLiabilities + residual),
    residual,
    detail: {
      grossAssets,
      accumulatedDep,
      disposalProceeds,
      sundryDebtors,
      closingStock,
      sundryCreditors,
      transporterPayable,
      brokerPayable,
      gstPayable,
      gstCredit,
      bankBalance,
    },
  };
};

/**
 * Trading summary that sits beside the balance sheet — the closest honest
 * equivalent of a Trading Account from this data.
 */
export const buildTradingSummary = ({
  salesVouchers = [],
  purchaseVouchers = [],
  creditNotes = [],
  freightVouchers = [],
  stockSummary = [],
  range,
}) => {
  const sales = sumBy(filterPeriod(salesVouchers, range), "taxable");
  const returns = sumBy(filterPeriod(creditNotes, range), "taxable");
  const purchases = sumBy(filterPeriod(purchaseVouchers, range), "taxable");
  const freight = sumBy(filterPeriod(freightVouchers, range), (r) =>
    round2(num(r.freightAmount) + num(r.other) - num(r.claim)),
  );
  const closingStock = round2(stockSummary.reduce((a, r) => a + num(r.value), 0));

  const netSales = round2(sales - returns);
  const costOfGoods = round2(purchases + freight);
  const grossMargin = round2(netSales - costOfGoods);

  return {
    sales,
    returns,
    netSales,
    purchases,
    freight,
    costOfGoods,
    closingStock,
    grossMargin,
    marginPct: netSales > 0 ? round2((grossMargin / netSales) * 100) : 0,
  };
};
