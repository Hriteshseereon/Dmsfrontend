import React, { useEffect, useState, useMemo } from "react";
import { Table, Card, Button, Input, Tag } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getOrganizations } from "../../../../../api/organizations";

export default function OrganisationList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoading(true);
      try {
        const res = await getOrganizations();
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  const tableData = useMemo(
    () =>
      data.map((org) => ({
        key: org.id,
        id: org.id,
        orgName: org.registered_name,
        mobile: org.phone_number_1,
        organisationType: org.organisation_type,
        partners: org.number_of_partners,
        status: org.is_active ? "Active" : "Inactive",
      })),
    [data],
  );

  const filteredData = tableData.filter((item) => {
    const s = searchText.toLowerCase();
    return (
      item.orgName?.toLowerCase().includes(s) ||
      item.mobile?.includes(s) ||
      item.organisationType?.toLowerCase().includes(s)
    );
  });

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Organisation</span>,
      dataIndex: "orgName",
      render: (text) => (
        <span className="text-amber-800 font-semibold">{text}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Mobile</span>,
      dataIndex: "mobile",
    },
    {
      title: <span className="text-amber-700 font-semibold">Type</span>,
      dataIndex: "organisationType",
    },
    {
      title: <span className="text-amber-700 font-semibold">Partners</span>,
      dataIndex: "partners",
      render: (v) => v ?? "-",
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Status</span>,
    //   dataIndex: "status",
    //   render: (s) => <Tag color={s === "Active" ? "green" : "red"}>{s}</Tag>,
    // },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="!text-blue-500 cursor-pointer"
            onClick={() => navigate(`/organisation/view/${record.id}`)}
          />
          <EditOutlined
            className="!text-red-500 cursor-pointer"
            onClick={() => navigate(`/organisation/edit/${record.id}`)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-amber-700 font-semibold">
              Organisation Master
            </span>
            <div className="flex gap-2">
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64 border-amber-300"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="!bg-amber-500 border-amber-500"
                onClick={() => navigate("/organisation/add")}
              >
                Add
              </Button>
            </div>
          </div>
        }
      >
        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          pagination={false}
          rowKey="key"
        />
      </Card>
    </div>
  );
}
