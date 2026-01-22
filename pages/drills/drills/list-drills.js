import GetAllDrills from "@/components/data/GetAllDrills";
import Layout from "@/components/layout/Layout";

export default function ListDrills() {
    return <Layout content={<>
        <GetAllDrills />
    </>} />
}