// app/batchesedit/page.js
import { Suspense } from "react";
import EditClientPage from "../../components/batchesedit/EditPage.jsx"

export default function BatchesEditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditClientPage />
    </Suspense>
  );
}
