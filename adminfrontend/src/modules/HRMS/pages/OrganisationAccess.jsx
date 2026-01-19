import organisations from "../../../data/organisations.json";
import modules from "../../../data/modules.json";
import { useState } from "react";

export default function OrganisationAccess() {
  const [orgList, setOrgList] = useState(organisations);
  const [orgName, setOrgName] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);

  const handleCreateOrg = () => {
    const newOrg = { id: orgName, name: orgName, modules: selectedModules };
    setOrgList([...orgList, newOrg]);
    setOrgName("");
    setSelectedModules([]);
  };

  return (
    <div className="p-4 bg-white border rounded-lg mt-4">
      <h4 className="font-semibold mb-2">Add Organisation</h4>
      <input
        className="border p-2 mr-2"
        placeholder="Organisation Name"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 my-2">
        {modules.map((m) => (
          <label key={m.id} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={selectedModules.includes(m.id)}
              onChange={() =>
                setSelectedModules(
                  selectedModules.includes(m.id)
                    ? selectedModules.filter((mod) => mod !== m.id)
                    : [...selectedModules, m.id]
                )
              }
            />
            {m.name}
          </label>
        ))}
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleCreateOrg}
      >
        Create Organisation
      </button>

      <div className="mt-4">
        <h5 className="font-medium mb-2">Existing Organisations</h5>
        {orgList.map((o) => (
          <div key={o.id} className="border p-2 mb-1">
            {o.name} - {o.modules.join(", ")}
          </div>
        ))}
      </div>
    </div>
  );
}
