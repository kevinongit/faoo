export default function DataTable({ data, title }) {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]).filter(
    (key) =>
      key !== "approval_details" &&
      key !== "daily_sales" &&
      key !== "cash_receipts" &&
      key !== "tax_invoices"
  );

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2 text-gray-800">{title}</h3>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 border text-left text-sm font-semibold text-gray-700"
                >
                  {header.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td
                    key={header}
                    className="px-4 py-2 border text-sm text-gray-600"
                  >
                    {JSON.stringify(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
