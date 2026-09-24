/**
 * Common chrome for every Accounts report:
 * title, period picker, search, PDF + Excel export, loading and error states.
 * Styled to match the DMS design language (amber borders, action bars, rounded cards).
 */
import React from "react";
import {
  Row,
  Col,
  DatePicker,
  Button,
  Input,
  Alert,
  Spin,
  Tooltip,
  Tag,
  Space,
} from "antd";
import {
  FilePdfOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  SearchOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

const ReportShell = ({
  title,
  subtitle,
  range,
  onRangeChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  onPdf,
  onExcel,
  onRefresh,
  loading = false,
  detailLoading = false,
  error = null,
  basisNote = "",
  extra = null,
  summary = null,
  children,
  showSearch = true,
  showRange = true,
}) => (
  <div className="space-y-3">
    {/* Header bar */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h2 className="text-xl font-bold text-amber-900 mb-0.5">{title}</h2>
        {subtitle && <p className="text-amber-700 text-xs mb-0">{subtitle}</p>}
      </div>

      {detailLoading && (
        <Tag color="gold" className="px-2.5 py-1 text-xs font-semibold">
          <Spin size="small" className="mr-2" />
          Loading document details...
        </Tag>
      )}
    </div>

    {/* Basis / Derived Note */}
    {basisNote && (
      <div className="flex items-start gap-2 text-xs text-amber-900 bg-amber-50/80 border-l-4 border-amber-400 px-3.5 py-2 rounded-r-md shadow-2xs">
        <InfoCircleOutlined className="text-amber-600 mt-0.5" />
        <span>{basisNote}</span>
      </div>
    )}

    {/* Error Alert */}
    {error && (
      <Alert
        type="error"
        showIcon
        className="mb-2"
        message="Could not load accounting data"
        description={error?.message || "Please retry, or check your connection."}
      />
    )}

    {/* KPI Summary Cards Strip */}
    {summary}

    {/* Filter & Action Controls Bar */}
    <Row justify="space-between" align="middle" gutter={[12, 12]} className="bg-white p-2.5 rounded-lg border border-amber-200/80 shadow-2xs">
      <Col>
        <Space wrap size="middle">
          {showSearch && (
            <Input
              allowClear
              prefix={<SearchOutlined className="text-amber-600!" />}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="border-amber-300! focus:border-amber-500!"
              style={{ width: 250 }}
            />
          )}

          {showRange && (
            <RangePicker
              value={range}
              onChange={onRangeChange}
              className="border-amber-300! text-amber-900!"
              style={{ width: 250 }}
              format="DD-MM-YYYY"
              placeholder={["From Date", "To Date"]}
              allowClear
            />
          )}

          {extra}

          {onRefresh && (
            <Tooltip title="Reload latest data">
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              >
                Refresh
              </Button>
            </Tooltip>
          )}
        </Space>
      </Col>

      <Col>
        <Space wrap size="small">
          {onExcel && (
            <Button
              icon={<FileExcelOutlined />}
              onClick={onExcel}
              className="border-amber-400! text-amber-700! hover:bg-amber-100! font-semibold"
            >
              Export Excel
            </Button>
          )}

          {onPdf && (
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={onPdf}
              className="bg-amber-700! border-amber-700! hover:bg-amber-800! font-semibold text-white!"
            >
              Print PDF
            </Button>
          )}
        </Space>
      </Col>
    </Row>

    {/* Main Data Table Card */}
    <div className="border border-amber-300 rounded-lg shadow-md bg-white overflow-hidden">
      <Spin spinning={loading}>
        {children}
      </Spin>
    </div>
  </div>
);

export default ReportShell;
