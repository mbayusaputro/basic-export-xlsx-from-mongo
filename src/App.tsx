import { useState } from 'react';
import * as XLSX from 'xlsx';

import './App.css';
import { getMongo } from './utils/mongo';

function App() {
  const [company, setCompany] = useState('');
  const [count, setCount] = useState(0);
  const [date, setDate] = useState({
    start: new Date().toISOString(),
    end: new Date().toISOString(),
  });

  const exportToExcel = (data: any[] = []) => {
    const name = count === 0 ? "summary" : "chat_histories";
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${name}_${Date.now()}.xlsx`);
  };

  return (
    <>
      <div>
        <img
          src="https://www.svgrepo.com/show/331488/mongodb.svg"
          className="logo"
          alt="Mongo logo"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Microsoft_Excel_2013-2019_logo.svg/1200px-Microsoft_Excel_2013-2019_logo.svg.png"
          className="logo"
          alt="Excel logo"
        />
      </div>
      <h1>Mongo + Excel</h1>
      <div className="card">
        <div>
          <label htmlFor="company">Company ID: </label>
          <input
            type="text"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="start">Start: </label>
          <input
            type="date"
            id="start"
            onChange={(e) =>
              setDate((prev) => ({
                ...prev,
                start: new Date(e.target.value).toISOString(),
              }))
            }
          />
          &nbsp;&nbsp;&nbsp;
          <label htmlFor="end">End: </label>
          <input
            type="date"
            id="end"
            onChange={(e) =>
              setDate((prev) => ({
                ...prev,
                end: new Date(e.target.value).toISOString(),
              }))
            }
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div>
            <input
              type="checkbox"
              id="summary"
              value={0}
              checked={count === 0}
              onChange={() => setCount(0)}
            />
            <label htmlFor="summary"> Summary (Sheet 1)</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="chat"
              value={1}
              checked={count === 1}
              onChange={() => setCount(1)}
            />
            <label htmlFor="chat"> Chat Histories (Sheet 2)</label>
          </div>
        </div>
        <button
          onClick={async () => {
            const resp = await getMongo({
              type: count,
              companyId: company,
              ...date,
            });
            exportToExcel(resp);
          }}
        >
          Export
        </button>
      </div>
      <p className="read-the-docs">Made by Ryuguji</p>
    </>
  );
}

export default App;
