/* eslint-disable react-refresh/only-export-components */
/**
 * Amber-themed antd Table wrapper plus the column helpers every Accounts
 * report uses (amount columns, date columns, a View action, a totals row).
 * Matches the DMS standard table styling.
 */
import React from "react";
import { Table, Button, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { inr, fmtDate, qty as fmtQty, num, drcr } from "../lib/format";

export const th = (label) => (
  <span className="text-amber-900 font-bold text-xs uppercase tracking-wide">
    {label}
  </span>
);

export const textCol = (title, dataIndex, opts = {}) => ({
  title: th(title),
  dataIndex,
  key: dataIndex,
  ...opts,
  render:
    opts.render ||
    ((v) => (
      <span className="font-semibold text-gray-800">
        {v === 0 ? "0" : v || "-"}
      </span>
    )),
});

export const codeCol = (title, dataIndex, opts = {}) => ({
  title: th(title),
  dataIndex,
  key: dataIndex,
  ...opts,
  render:
    opts.render ||
    ((v) => (
      <span className="font-bold text-amber-900 cursor-pointer hover:underline">
        {v || "-"}
      </span>
    )),
});

export const dateCol = (title, dataIndex, opts = {}) => ({
  title: th(title),
  dataIndex,
  key: dataIndex,
  width: 120,
  ...opts,
  render: (v) => <span className="font-medium text-gray-700">{fmtDate(v)}</span>,
});

export const amountCol = (title, dataIndex, opts = {}) => ({
  title: <span className="text-amber-900 font-bold text-xs uppercase tracking-wide block text-right">{title}</span>,
  dataIndex,
  key: dataIndex,
  width: 140,
  align: "right",
  ...opts,
  render:
    opts.render ||
    ((v) => (
      <span className="font-bold text-gray-900 tabular-nums">
        {inr(v, { blankZero: opts.blankZero !== false })}
      </span>
    )),
});

export const qtyCol = (title, dataIndex, opts = {}) => ({
  title: <span className="text-amber-900 font-bold text-xs uppercase tracking-wide block text-right">{title}</span>,
  dataIndex,
  key: dataIndex,
  width: 120,
  align: "right",
  ...opts,
  render: (v) => <span className="font-bold text-amber-950 tabular-nums">{fmtQty(v)}</span>,
});

/** Signed balance rendered the Tally way: 12,300.00 Dr */
export const balanceCol = (title, dataIndex, opts = {}) => ({
  title: <span className="text-amber-900 font-bold text-xs uppercase tracking-wide block text-right">{title}</span>,
  dataIndex,
  key: dataIndex,
  width: 160,
  align: "right",
  ...opts,
  render: (v) => {
    const b = drcr(v);
    return (
      <span className="tabular-nums font-bold text-gray-900">
        {inr(b.amount)}{" "}
        <Tag
          color={b.side === "Dr" ? "volcano" : "success"}
          className="font-bold ml-1 px-1.5 py-0 text-xs"
        >
          {b.side}
        </Tag>
      </span>
    );
  },
});

export const viewCol = (onView, label = "View") => ({
  title: th("Actions"),
  key: "__view",
  width: 100,
  fixed: "right",
  align: "center",
  render: (_, record) => (
    <Button
      size="small"
      type="link"
      icon={<EyeOutlined />}
      className="text-amber-700! font-bold hover:text-amber-900! p-0"
      onClick={() => onView(record)}
    >
      {label}
    </Button>
  ),
});

const TYPE_COLOURS = {
  Sales: "gold",
  Purchase: "blue",
  "Credit Note": "volcano",
  Receipt: "green",
  Payment: "purple",
  Freight: "cyan",
  Journal: "default",
  Adjustment: "geekblue",
  "Debit Note": "magenta",
  "Contra (OD)": "orange",
};

export const VoucherTypeTag = ({ type }) => (
  <Tag color={TYPE_COLOURS[type] || "default"} className="font-bold px-2 py-0.5">
    {type}
  </Tag>
);

export const typeCol = (title = "Vch Type", dataIndex = "type") => ({
  title: th(title),
  dataIndex,
  key: dataIndex,
  width: 130,
  render: (v) => <VoucherTypeTag type={v} />,
});

/**
 * Table with the DMS house style and an optional totals footer.
 *
 * @param {object[]} totals [{ colSpan, label }] or a map of dataIndex -> value
 */
const ReportTable = ({
  columns,
  dataSource,
  totals = null,
  totalsLabel = "Total",
  rowKey = "key",
  scrollX = 1100,
  pageSize = 10,
  size = "middle",
  onRow = null,
  ...rest
}) => (
  <Table
    columns={columns}
    dataSource={dataSource}
    rowKey={rowKey}
    size={size}
    bordered
    pagination={
      dataSource?.length > pageSize
        ? {
            pageSize,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} entries`,
          }
        : false
    }
    scroll={{ x: scrollX }}
    onRow={
      onRow ||
      ((record) => ({
        className: "hover:bg-amber-50/40 transition-colors",
      }))
    }
    summary={
      totals
        ? () => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-amber-50/90 font-bold text-amber-950">
                {columns.map((c, idx) => {
                  if (idx === 0 && Array.isArray(totals)) {
                    // Span-based summary array
                    return totals.map((t, tIdx) => (
                      <Table.Summary.Cell
                        key={tIdx}
                        index={tIdx}
                        colSpan={t.colSpan || 1}
                        className={t.align === "right" ? "text-right" : "text-left"}
                      >
                        {t.label}
                      </Table.Summary.Cell>
                    ));
                  }

                  if (!Array.isArray(totals)) {
                    // Keyed map of totals
                    if (idx === 0) {
                      return (
                        <Table.Summary.Cell key={c.key || idx} index={idx}>
                          <span className="font-bold text-amber-900">{totalsLabel}</span>
                        </Table.Summary.Cell>
                      );
                    }
                    const val = totals[c.dataIndex || c.key];
                    return (
                      <Table.Summary.Cell
                        key={c.key || idx}
                        index={idx}
                        className={c.align === "right" ? "text-right" : "text-left"}
                      >
                        {val !== undefined ? inr(val) : ""}
                      </Table.Summary.Cell>
                    );
                  }

                  return null;
                })}
              </Table.Summary.Row>
            </Table.Summary>
          )
        : null
    }
    {...rest}
  />
);

export default ReportTable;
