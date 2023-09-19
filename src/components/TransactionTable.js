import React from 'react';

function TransactionTable({ data }) {
  return (
    <div>
      <h2>Transaction Table</h2>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
          {/* <script>
            for ([key, value]) of Object.entries(data){console.log(`${key}: ${value}`)}
          </script> */}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;