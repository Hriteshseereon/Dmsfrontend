import EmployeeList from "./pages/EmployeeList";
import RoleAccess from "./pages/RoleAccess";
import OrganisationAccess from "./pages/OrganisationAccess";

export default function HRMS() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-3">
        Human Resource Management System
      </h2>
      <EmployeeList />
      <RoleAccess />
      <OrganisationAccess />
    </div>
  );
}
