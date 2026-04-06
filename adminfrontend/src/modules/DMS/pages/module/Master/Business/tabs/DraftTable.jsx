// ─────────────────────────────────────────────────────────────────────────────
// DraftTable.jsx
// Standalone component that lists all saved customer form drafts.
// Props:
//   onContinue(draftId)  – called when user clicks "Continue" on a row
//   onDelete(draftId)    – called when user confirms deletion of a row
//   refreshTrigger       – increment this value to force the table to reload
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, Tag, Empty, Typography } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  getAllCustomerDrafts,
  deleteDraft,
} from "../../../../../../../utils/Customerdraftutils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

export default function DraftTable({ onContinue, onDelete, refreshTrigger }) {
  const [drafts, setDrafts] = useState([]);

  const reload = () => setDrafts(getAllCustomerDrafts());

  useEffect(() => {
    reload();
  }, [refreshTrigger]);

  const handleDelete = (id) => {
    deleteDraft(id);
    onDelete?.(id);
    reload();
  };

  if (!drafts.length) {
    return (
      <div className="border border-amber-200 rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <FileTextOutlined className="text-amber-500 text-lg" />
          <h2 className="text-base font-semibold text-amber-700 m-0">
            Saved Drafts
          </h2>
        </div>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-amber-400 text-sm">No drafts saved yet</span>
          }
        />
      </div>
    );
  }

  const columns = [
    {
      title: (
        <span className="text-amber-700 font-semibold text-xs">
          Customer Name
        </span>
      ),
      dataIndex: "name",
      render: (text) => (
        <span className="text-amber-800 font-medium">{text || "—"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold text-xs">Email</span>
      ),
      dataIndex: "email",
      render: (text) => (
        <span className="text-amber-700 text-sm">{text || "—"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold text-xs">Mobile</span>
      ),
      dataIndex: "mobile",
      render: (text) => (
        <span className="text-amber-700 text-sm">{text || "—"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold text-xs">Last Saved</span>
      ),
      dataIndex: "savedAt",
      render: (val) => (
        <Tag
          icon={<ClockCircleOutlined />}
          color="gold"
          className="text-xs font-normal"
        >
          {val ? dayjs(val).fromNow() : "—"}
        </Tag>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold text-xs">Actions</span>
      ),
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none! text-xs!"
            onClick={() => onContinue?.(record.id)}
          >
            Continue
          </Button>
          <Popconfirm
            title="Delete this draft?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Keep"
            okButtonProps={{
              className: "bg-red-500! border-none!",
              danger: true,
            }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="text-xs!"
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="border border-amber-200 rounded-lg p-4 bg-white shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-3">
        <FileTextOutlined className="text-amber-500 text-lg" />
        <h2 className="text-base font-semibold text-amber-700 m-0">
          Saved Drafts
        </h2>
        <Tag color="gold" className="ml-1">
          {drafts.length}
        </Tag>
      </div>
      <Text className="text-amber-500 text-xs block mb-3">
        These forms were not submitted. Click <b>Continue</b> to resume editing.
      </Text>
      <Table
        columns={columns}
        dataSource={drafts}
        rowKey="id"
        size="small"
        bordered
        pagination={false}
        rowClassName="hover:bg-amber-50"
      />
    </div>
  );
}
