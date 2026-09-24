import React from "react";
import { Row, Col, Card, Tooltip } from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  TagsOutlined,
  WalletOutlined,
  InboxOutlined,
  PercentageOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const TONE_CONFIG = {
  amber: {
    border: "border-amber-200",
    bg: "bg-amber-50/50",
    title: "text-amber-800",
    value: "text-amber-950",
    icon: <DollarOutlined className="text-2xl text-amber-500 opacity-80" />,
  },
  green: {
    border: "border-green-200",
    bg: "bg-green-50/50",
    title: "text-green-800",
    value: "text-green-950",
    icon: <CheckCircleOutlined className="text-2xl text-green-500 opacity-80" />,
  },
  red: {
    border: "border-red-200",
    bg: "bg-red-50/50",
    title: "text-red-800",
    value: "text-red-950",
    icon: <ExclamationCircleOutlined className="text-2xl text-red-500 opacity-80" />,
  },
  blue: {
    border: "border-blue-200",
    bg: "bg-blue-50/50",
    title: "text-blue-800",
    value: "text-blue-950",
    icon: <ShoppingOutlined className="text-2xl text-blue-500 opacity-80" />,
  },
  purple: {
    border: "border-purple-200",
    bg: "bg-purple-50/50",
    title: "text-purple-800",
    value: "text-purple-950",
    icon: <TagsOutlined className="text-2xl text-purple-500 opacity-80" />,
  },
};

const SummaryCards = ({ items = [], gutter = [12, 12] }) => {
  if (!items.length) return null;
  const span = Math.max(4, Math.floor(24 / Math.min(items.length, 6)));

  return (
    <Row gutter={gutter} className="mb-4">
      {items.map((it, idx) => {
        const tone = TONE_CONFIG[it.tone || "amber"] || TONE_CONFIG.amber;
        return (
          <Col key={it.label || idx} xs={24} sm={12} md={8} lg={span} xl={span}>
            <Tooltip title={it.hint || ""}>
              <div
                className={`border ${tone.border} ${tone.bg} rounded-lg p-3.5 shadow-xs hover:shadow-md transition-all h-full flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${tone.title} uppercase tracking-wider truncate`}>
                    {it.label}
                  </span>
                  {it.icon || tone.icon}
                </div>
                <div className="mt-1.5">
                  <div className={`text-2xl font-black ${tone.value} tabular-nums leading-tight`}>
                    {it.value}
                  </div>
                  {it.sub && (
                    <div className="text-xs text-gray-500 font-medium mt-1">
                      {it.sub}
                    </div>
                  )}
                </div>
              </div>
            </Tooltip>
          </Col>
        );
      })}
    </Row>
  );
};

export default SummaryCards;
