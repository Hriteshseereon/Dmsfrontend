import { Routes, Route } from "react-router-dom"
import WealthDashboard from "./WealthDashboard"
import Stock from "./Stock"
import MutualFunds from "./MutualFunds"
import Bank from "./Bank"
import Nps from "./Nps"
import Privatequity from "./Privatequity"
import Deposits from "./Deposits"
import Ppf from "./Ppf";
import Epf from "./Epf";
import Fd from "./Fd";
import PostOffice from "./PostOffice";
import Etf from "./Etf";
import Ulip from "./Ulip";
import Aif from "./Aif";
import Gold from "./Gold"
import Silver from "./Silver"
export default function WMS() {
    return (
        <Routes>
            <Route index element={<WealthDashboard />} />
            <Route path="dashboard" element={<WealthDashboard />} />
            <Route path="stock" element={<Stock />} />
            <Route path="mutualfunds" element={<MutualFunds />} />
            <Route path="bank" element={<Bank />} />
            <Route path="nps" element={<Nps />} />
            <Route path="aif" element={<Aif />} />
            <Route path="fd" element={<Fd />} />
            <Route path="ppf" element={<Ppf />} />
            <Route path="epf" element={<Epf />} />
            <Route path="postoffice" element={<PostOffice />} />
            <Route path="etf" element={<Etf />} />
            <Route path="ulip" element={<Ulip />} />
            <Route path="privatequity" element={<Privatequity />} />
            <Route path="deposits" element={<Deposits />} />
            <Route path="gold" element={<Gold />} />
            <Route path="silver" element={<Silver />} />

        </Routes>
    )
}