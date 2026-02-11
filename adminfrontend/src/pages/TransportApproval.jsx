import React, { useEffect, useState } from "react";
import { Table, Button, Select, message } from "antd";
import {
  getAllpendingTransporters,
  approveTransporter,
  getOrganizations,
} from "../api/transport"; // adjust path

const { Option } = Select;

function TransportApproval() {
  const [transporters, setTransporters] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [pendingRes, orgRes] = await Promise.all([
        getAllpendingTransporters(),
        getOrganizations(),
      ]);

      // Format transporter data
      const formattedTransporters = pendingRes.map((t) => ({
        key: t.id,
        id: t.id,
        transporter_id: t.transport_id,
        registered_name: t.registered_name,
        email_id: t.email_id,
        phone_number: t.phone_number,
        selectedOrganisations: [],
        approved: false,
      }));

      setTransporters(formattedTransporters);
      setOrganisations(orgRes);
    } catch (error) {
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SELECT HANDLER ================= */

  const handleOrgSelect = (id, values) => {
    setTransporters((prev) =>
      prev.map((t) =>
        t.key === id ? { ...t, selectedOrganisations: values } : t,
      ),
    );
  };

  /* ================= APPROVE HANDLER ================= */

  const handleApprove = async (record) => {
    try {
      if (record.selectedOrganisations.length === 0) {
        return message.warning("Please select organisation");
      }

      const payload = {
        transporter_id: record.id,
        organisation_ids: record.selectedOrganisations,
      };

      await approveTransporter(payload);

      message.success("Transporter Approved Successfully");

      // Remove from list after approve
      setTransporters((prev) => prev.filter((t) => t.key !== record.key));
    } catch (error) {
      message.error("Approval failed");
    }
  };

  /* ================= TABLE COLUMNS ================= */

  const columns = [
    {
      title: "Registered Name",
      dataIndex: "registered_name",
    },
    {
      title: "Email",
      dataIndex: "email_id",
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
    },
    {
      title: "Link Organisation",
      render: (_, record) => (
        <Select
          mode="multiple"
          placeholder="Select organisation"
          style={{ width: 200 }}
          value={record.selectedOrganisations}
          onChange={(values) => handleOrgSelect(record.key, values)}
        >
          {organisations.map((org) => (
            <Option key={org.id} value={org.id}>
              {org.registered_name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleApprove(record)}>
          Approve
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Table
        columns={columns}
        dataSource={transporters}
        loading={loading}
        pagination={false}
      />
    </div>
  );
}

export default TransportApproval;
