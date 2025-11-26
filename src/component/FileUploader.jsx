import React, { useEffect, useState } from "react";
import { API_URL, apiMultipleUpload } from "../db/apiService";

export default function FileUploader() {
  const [files, setFiles] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
 const [fileText, setFileText] = useState("");

  useEffect(() => {
    if (previewFile && previewFile.type.startsWith("text/")) {
      previewFile.text().then((txt) => setFileText(txt));
    }
  }, [previewFile]);

    // Open preview modal
  const openPreview = (file) => setPreviewFile(file);

  // Close preview modal
  const closePreview = () => setPreviewFile(null);

  // Add or append files
  const handleAddFiles = (e) => {
    const newFiles = Array.from(e.target.files);

    // Add a preview URL for each file
    const withPreview = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFiles((prev) => [...prev, ...withPreview]);
  };

  // Remove file
  const removeFile = (index) => {
    const updated = [...files];
    URL.revokeObjectURL(updated[index].preview); // cleanup
    updated.splice(index, 1);
    setFiles(updated);
  };

  // Upload all files to server
  const uploadAll = async () => {
    const formData = new FormData();

    files.forEach((f) => {
      formData.append("files", f.file); // "files" must match your API param name
    });

    const response = await fetch( API_URL+"/upload", {
      method: "POST",
      body: formData,
    });

    const res = await response.json();
    console.log("Upload response:", res);

    alert("Uploaded Successfully!");
    setFiles([]); // Clear after upload
  };



  return (
    <div className="p-4">
<h2 className="bg-red-200 text-center mb-2 text-xl">File Uploader</h2>
      {/* Add File Button */}
      <label className="block  cursor-pointer bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Add More Files
        <input
          type="file"
          multiple
          className="hidden"
          onChange={handleAddFiles}
        />
      </label>

      {/* No files message */}
      {files.length === 0 && (
        <p className="text-gray-500">No files selected.</p>
      )}

      {/* File List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {files.map((f, index) => (
          <div
            key={index}
            className="border rounded shadow p-3 flex flex-col items-center"
          >
            {/* Preview */}
            {f.file.type.startsWith("image/") ? (
              <img
                src={f.preview}
                alt="preview"
                className="w-full h-32 object-cover rounded"
                onClick={() => openPreview(f.file)}
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center bg-gray-200 rounded"  
                 onClick={() => openPreview(f.file)}
              >
                📄 {f.file.type}
              </div>
            )}

            {/* Details */}
            <p className="mt-2 text-sm font-semibold">{f.file.name}</p>
            <p className="text-xs text-gray-500">
              {(f.file.size / 1024).toFixed(2)} KB
            </p>

            {/* Remove Button */}
            <button
              onClick={() => removeFile(index)}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Final Upload Button */}
      {files.length > 0 && (
        <button
          onClick={uploadAll}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded"
        >
          Upload Files
        </button>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closePreview}
        >
          <div
            className="bg-white p-4 rounded max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closePreview} className="float-right mb-2 bg-red-500 text-white px-2 py-1 rounded">
              Close
            </button>

            {previewFile.type.startsWith("image/") && (
              <img src={URL.createObjectURL(previewFile)} alt="preview" className="w-full" />
            )}

            {previewFile.type === "application/pdf" && (
              <iframe
                src={URL.createObjectURL(previewFile)}
                className="w-full h-[70vh]"
                title={previewFile.name}

              ></iframe>
            )}

            {/* {previewFile.type.startsWith("text/") && (
              <p className="whitespace-pre-wrap max-h-[70vh] overflow-auto p-2 bg-black-100">
                {previewFile.text().then((txt) => txt)}
              </p>
            )} */}

               {previewFile.type.startsWith("text/") && (
        <p className="whitespace-pre-wrap max-h-[70vh] overflow-auto p-2 bg-gray-100">
          {fileText}
        </p>
      )}

            {!previewFile.type.startsWith("image/") &&
              previewFile.type !== "application/pdf" &&
              previewFile.type.startsWith("text/") === false && (
                <p>Cannot preview this file type.</p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
