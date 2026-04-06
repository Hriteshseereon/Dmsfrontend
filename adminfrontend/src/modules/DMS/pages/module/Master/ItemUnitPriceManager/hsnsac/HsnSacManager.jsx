import React, { useState } from "react";
import { Card, Table, Button, Modal, Checkbox, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import hsnSacData from "../../hsnSacData.json";
import { getHSNSACCodes, getSACCodes } from "../../../../../../../api/product";

/* ================= Code Selector (Structured Modal) ================= */
const CodeSelector = ({ open, title, data, onClose, onAdd }) => {
  const [selected, setSelected] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // Show 6 items (3 rows of 2) by default for a balanced look
  const visibleList = showAll ? data || [] : (data || []).slice(0, 6);

  const toggleSelect = (item) => {
    setSelected((prev) =>
      prev.some((i) => i.code === item.code)
        ? prev.filter((i) => i.code !== item.code)
        : [...prev, item],
    );
  };

  const handleAdd = () => {
    onAdd(selected);
    setSelected([]);
    setShowAll(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={
        <span className="text-lg! font-bold! text-amber-800!">{title}</span>
      }
      onCancel={onClose}
      footer={null}
      width={650}
      centered
    >
      <div className="pt-4">
        {/* Two-Column Grid Layout */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {visibleList.map((item) => (
            <div key={item.code} className="flex items-start">
              <Checkbox
                checked={selected.some((i) => i.code === item.code)}
                onChange={() => toggleSelect(item)}
              >
                <div className="leading-tight">
                  <span className="text-amber-700 font-bold mr-1">
                    {item.code}
                  </span>
                  <span className="text-amber-800/80 font-medium">
                    – {item.description}
                  </span>
                </div>
              </Checkbox>
            </div>
          ))}
        </div>

        {/* Show More/Less Toggle */}
        {data.length > 6 && (
          <div className="mt-4">
            <Button
              type="link"
              className="text-blue-500 p-0 h-auto text-sm font-semibold"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "Show More"}
            </Button>
          </div>
        )}

        {/* Footer Action */}
        <div className="mt-8 flex justify-end border-t pt-4">
          <Button
            type="primary"
            size="large"
            disabled={!selected.length}
            onClick={handleAdd}
            className={`px-8 rounded shadow-sm border-none ${
              selected.length
                ? "bg-amber-500! hover:bg-amber-600!"
                : "bg-gray-100!"
            }`}
          >
            Add Selected
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/* ================= MAIN COMPONENT ================= */
const HsnSacManager = () => {
  const [hsnList, setHsnList] = useState([]);
  const [sacList, setSacList] = useState([]);
  const [modalType, setModalType] = useState(null);
  // const fetAllHSNSACCodes = async () => {
  //   try {
  //     const data = await getHSNSACCodes();
  //     setHsnList(data);
  //     setSacList(data.sac);
  //     console.log("Fetched HSN codes:", data);
  //     console.log("Fetched SAC codes:", data.sac);
  //     return data;
  //   } catch (error) {
  //     console.error("Error fetching HSN/SAC codes:", error);
  //     return { hsn: [], sac: [] };
  //   }
  // };
  const fetAllHSNSACCodes = async () => {
    try {
      const hsnData = await getHSNSACCodes();
      const sacData = await getSACCodes();

      console.log("HSN API 👉", hsnData);
      console.log("SAC API 👉", sacData);

      const normalizedHsn = Array.isArray(hsnData)
        ? hsnData.map((item) => ({
            ...item,
            code: item.hsn_code,
            description: item.description,
          }))
        : [];

      const normalizedSac = Array.isArray(sacData)
        ? sacData.map((item) => ({
            ...item,
            code: item.sac_code,
            description: item.description,
          }))
        : [];

      setHsnList(normalizedHsn);
      setSacList(normalizedSac);

      // Update modal data source
      hsnSacData.hsn = normalizedHsn;
      hsnSacData.sac = normalizedSac;

      return { hsn: normalizedHsn, sac: normalizedSac };
    } catch (error) {
      console.error("Error fetching HSN/SAC codes:", error);
      return { hsn: [], sac: [] };
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await fetAllHSNSACCodes();
      hsnSacData.hsn = data.hsn;
      hsnSacData.sac = data.sac;
    };
    fetchData();
  }, []);

  const columns = (onDelete) => [
    {
      title: <span className="text-amber-600!">Code</span>,
      dataIndex: "code",
      width: 100,
      render: (text) => <span className=" text-amber-700!">{text}</span>,
    },
    {
      title: <span className="text-amber-600!">Description</span>,
      dataIndex: "description",
      width: 180,
      render: (text) => <span className=" text-amber-700!">{text}</span>,
    },
    {
      title: <span className="text-amber-600!">Action</span>,
      width: 80,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title=" Are you sure you want to delete ?"
          onConfirm={() => onDelete(record.code)}
        >
          <DeleteOutlined className="cursor-pointer! text-red-500!" />
        </Popconfirm>
      ),
    },
  ];

  const addItems = (type, items) => {
    const listSetter = type === "hsn" ? setHsnList : setSacList;
    listSetter((prev) => [
      ...prev,
      ...items.filter((i) => !prev.some((p) => p.code === i.code)),
    ]);
  };

  return (
    <div className="p-2">
      <h2 className="text-lg font-semibold text-amber-700 mb-2 mt-0 pt-0">
        Easily manage your HSN and SAC code masters{" "}
      </h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HSN TABLE CARD */}
        <Card
          title={<span className="text-amber-700">HSN Codes</span>}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-amber-500! hover:bg-amber-600! border-none!"
              onClick={() => setModalType("hsn")}
            >
              Add HSN
            </Button>
          }
          className="shadow-sm border-amber-100"
        >
          <Table
            rowKey="code"
            columns={columns((code) =>
              setHsnList((prev) => prev.filter((i) => i.code !== code)),
            )}
            dataSource={hsnList}
            pagination={{ pageSize: 5 }}
            size="small"
            scroll={{ y: 100 }}
          />
        </Card>

        {/* SAC TABLE CARD */}
        <Card
          title={<span className="text-amber-700">SAC Codes</span>}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-amber-500! hover:bg-amber-600! border-none!"
              onClick={() => setModalType("sac")}
            >
              Add SAC
            </Button>
          }
          className="shadow-sm border-amber-100"
        >
          <Table
            rowKey="code"
            columns={columns((code) =>
              setSacList((prev) => prev.filter((i) => i.code !== code)),
            )}
            dataSource={sacList}
            pagination={{ pageSize: 5 }}
            size="small"
            scroll={{ y: 100 }}
          />
        </Card>
      </div>

      {/* MODAL CONTROLLER */}
      {modalType && (
        <CodeSelector
          open={!!modalType}
          title={`Select ${modalType.toUpperCase()} Codes`}
          data={hsnSacData[modalType]}
          onClose={() => setModalType(null)}
          onAdd={(items) => addItems(modalType, items)}
        />
      )}
    </div>
  );
};

export default HsnSacManager;
