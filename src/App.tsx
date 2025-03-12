/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useState } from "react";
import * as XLSX from "xlsx";

import "./App.css";
import { getMongo } from "./utils/mongo";
import { hexToUtf8, markdownToPlainText } from "./utils/helper";

interface IItem {
  name: string;
  data: any[];
}

function App() {
  const [keydb, setKeydb] = useState("");
  const [company, setCompany] = useState("");
  const [count, setCount] = useState(2);
  const [date, setDate] = useState({
    start: new Date().toISOString(),
    end: new Date().toISOString(),
  });

  const customArr: (data: any[]) => any[] = (data: any[] = []) => {
    const arr: any[] = [];
    for (const item of data) {
      const Answer = markdownToPlainText(hexToUtf8(item.Answer));
      arr.push({
        ...item,
        Created: new Date(item.Created).toString(),
        Question: item.Question,
        Answer,
      });
    }
    return arr;
  };

  const exportAll = (data: IItem[] = []) => {
    console.log(data);
    const workbook = XLSX.utils.book_new();
    for (const item of data) {
      let arr: any[] = item.data;
      if (item.name !== "Summary") {
        arr = customArr(item.data);
      }
      const worksheet = XLSX.utils.json_to_sheet(arr);
      XLSX.utils.book_append_sheet(workbook, worksheet, item.name);
    }
    XLSX.writeFile(workbook, `${Date.now()}.xlsx`);
  };

  const exportToExcel = (data: any[] = []) => {
    const name = count === 0 ? "Summary" : "Chat Histories";
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      count === 1 ? customArr(data) : data,
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
    XLSX.writeFile(workbook, `${name}_${Date.now()}.xlsx`);
  };

  const onExport = async () => {
    if (count === 2) {
      const request = {
        keydb,
        companyId: company,
        ...date,
      };
      const resp0 = await getMongo({
        type: 0,
        ...request,
      });
      const resp1 = await getMongo({
        type: 1,
        ...request,
      });
      exportAll([
        { name: "Summary", data: resp0 },
        { name: "Chat Histories", data: resp1 },
      ]);
    } else {
      const resp = await getMongo({
        type: count,
        keydb,
        companyId: company,
        ...date,
      });
      exportToExcel(resp);
    }
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
          <label htmlFor="company">Key DB: </label>
          <input
            type="text"
            id="keydb"
            value={keydb}
            onChange={(e) => setKeydb(e.target.value)}
          />
        </div>
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
            display: "flex",
            flexDirection: "column",
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
          <div>
            <input
              type="checkbox"
              id="all"
              value={2}
              checked={count === 2}
              onChange={() => setCount(2)}
            />
            <label htmlFor="all"> Summary & Chat Histories</label>
          </div>
        </div>
        <button onClick={onExport}>Export</button>
      </div>
      <p className="read-the-docs">Made by Ryuguji</p>
    </>
  );
}

export default App;
