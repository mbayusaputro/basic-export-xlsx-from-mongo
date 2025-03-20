/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import "./App.css";
import { getCompanies, getData } from "./utils/mongo";
import { decodeUnicodeEscapeSequences, markdownToPlainText } from "./utils/helper";
import Modal from "./utils/modal";
import HashLoader from "react-spinners/HashLoader";

const keydb = import.meta.env.REACT_APP_KEYDB ?? '';

interface IItem {
  name: string;
  data: any[];
}

interface IOptions {
  title: string;
  value: string;
}

function App() {
  const [isLoading, setLoading] = useState(false);
  const [company, setCompany] = useState("");
  const [count, setCount] = useState(2);
  const [date, setDate] = useState({
    start: new Date().toISOString(),
    end: new Date().toISOString(),
  });
  const [options, setOptions] = useState<IOptions[]>([]);

  useEffect(() => {
    const getOptions = async () => {
      const arr: any[] = [];
      const resp = await getCompanies();
      for (const item of resp) {
        const { title, _id } = item;
        arr.push({ title, value: _id });
      }
      setOptions(arr);
    }
    getOptions();
  }, [])

  const customArr: (data: any[]) => any[] = (data: any[] = []) => {
    const arr: any[] = [];
    for (const item of data) {
      const decodeAnswer = decodeUnicodeEscapeSequences(item.Answer)
      const Answer = markdownToPlainText(decodeAnswer);
      arr.push({
        ...item,
        Created: new Date(item.Created).toString(),
        Question: item.Question,
        Answer,
      });
    }
    return arr;
  };

  const onAlert = (e: any) => {
    alert(JSON.stringify(e));
    setLoading(false);
  }

  const exportAll = (data: IItem[] = []) => {
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
    setLoading(true);
    try {
      if (count === 2) {
        const request = {
          keydb,
          companyId: company,
          ...date,
        };
        const resp0 = await getData({
          type: 0,
          ...request,
        });
        const resp1 = await getData({
          type: 1,
          ...request,
        });
        exportAll([
          { name: "Summary", data: resp0 },
          { name: "Chat Histories", data: resp1 },
        ]);
      } else {
        const resp = await getData({
          type: count,
          keydb,
          companyId: company,
          ...date,
        });
        exportToExcel(resp);
      }
    } catch (e) {
      onAlert(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <Modal isOpen={isLoading} onClose={() => null}>
        <HashLoader color="#FFFFFF" />
      </Modal>
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
        {/* Dropdown */}
        <div className="dropdown-group">
          <label htmlFor="dropdown" className="dropdown-label">Company:</label>
          <select
            id="dropdown"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="dropdown-field"
          >
            <option value="">Select...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.title}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="company" className="input-label">Company ID:</label>
          <input
            type="text"
            id="company"
            value={company}
            className="input-field"
            disabled
          />
        </div>

        <div className="date-range-group">
          <div className="input-group">
            <label htmlFor="start" className="input-label">Start:</label>
            <input
              type="date"
              id="start"
              onChange={(e) =>
                setDate((prev) => ({
                  ...prev,
                  start: new Date(e.target.value).toISOString(),
                }))
              }
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label htmlFor="end" className="input-label">End:</label>
            <input
              type="date"
              id="end"
              onChange={(e) =>
                setDate((prev) => ({
                  ...prev,
                  end: new Date(e.target.value).toISOString(),
                }))
              }
              className="input-field"
            />
          </div>
        </div>

        <div className="checkbox-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="summary"
              value={0}
              checked={count === 0}
              onChange={() => setCount(0)}
              className="checkbox-input"
            />
            <label htmlFor="summary" className="checkbox-label">Summary (Sheet 1)</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="chat"
              value={1}
              checked={count === 1}
              onChange={() => setCount(1)}
              className="checkbox-input"
            />
            <label htmlFor="chat" className="checkbox-label">Chat Histories (Sheet 2)</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="all"
              value={2}
              checked={count === 2}
              onChange={() => setCount(2)}
              className="checkbox-input"
            />
            <label htmlFor="all" className="checkbox-label">Summary & Chat Histories</label>
          </div>
        </div>

        <button className="export-button" onClick={onExport}>Export</button>
      </div>
      <p className="read-the-docs">Made by Ryuguji</p>
    </div>
  );
}

export default App;
