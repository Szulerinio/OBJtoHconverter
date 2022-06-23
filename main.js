let current_blob = "";

const button = document.querySelector("#button");
const saveButton = document.querySelector("#saveButton");
const statusSpan = document.querySelector("#status");

const pickerOpts = {
  types: [
    {
      description: "OBJs",
      accept: {
        "other/*": [".obj"],
      },
    },
  ],
  excludeAcceptAllOption: true,
  multiple: false,
};

async function getTheFile() {
  // open file picker
  [fileHandle] = await window.showOpenFilePicker(pickerOpts);
  statusSpan.innerText = "wait";
  // get file contents
  const fileData = await fileHandle.getFile();
  const text = await fileData.text();
  const name = fileData.name.split(".")[0];
  console.log(text, name);
  parse(text, name);
}

async function saveFile() {
  // create a new handle
  const newHandle = await window.showSaveFilePicker();

  // create a FileSystemWritableFileStream to write to
  const writableStream = await newHandle.createWritable();

  // write our file
  await writableStream.write(current_blob);

  // close the file and write the contents to disk.
  await writableStream.close();
}

const parse = (text, name) => {
  console.log(text);
  const verts = getVerts(text, name);

  const texValues = getTex(text);
  const normalValues = getVertexNormals(text);
  const faces = getFaces(text, name, texValues, normalValues, verts);
  statusSpan.innerText = "ready";
  current_blob = faces;
};

const getVerts = (text, name) => {
  const dataLeftTrim = text.slice(text.indexOf("v "));
  const data2 = dataLeftTrim.slice(
    0,
    dataLeftTrim.search(/[^v \d\r\n,.\-]|v(?! )/i)
  );

  const dataArray = data2
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/v/g, "1.0")
    .trim()
    .split(" ");
  dataArray.push("1.0");
  const data = dataArray.slice(1);
  return data;
};

const getFaces = (text, name, texValues, normalValues, vertValues) => {
  const dataLeftTrim = text.slice(text.indexOf("f "));
  const data2 = dataLeftTrim.slice(
    0,
    dataLeftTrim.search(/[^f \d\r\n,./\-]|f(?! )/i)
  );

  const dataArray = data2
    .replace(/\r\n/g, "")
    .replace(/\n/g, "")
    .replace(/f/g, "")
    .trim()
    .split(" ");

  const faceIndexes = dataArray.map((el) => el.split("/")[0]);
  const texIndexes = dataArray.map((el) => el.split("/")[1]);
  const normalIndexes = dataArray.map((el) => el.split("/")[2]);

  const verts = faceIndexes.map(
    (el) =>
      `${vertValues[(el - 1) * 4]}f, ${vertValues[(el - 1) * 4 + 1]}f, ${
        vertValues[(el - 1) * 4 + 2]
      }f, ${vertValues[(el - 1) * 4 + 3]}f,`
  );
  const texes = texIndexes.map(
    (el) => `${texValues[(el - 1) * 2]}f, ${texValues[(el - 1) * 2 + 1]}f,`
  );
  const normals = normalIndexes.map(
    (el) =>
      `${normalValues[(el - 1) * 4]}f, ${normalValues[(el - 1) * 4 + 1]}f, ${
        normalValues[(el - 1) * 4 + 2]
      }f, ${normalValues[(el - 1) * 4 + 3]}f,`
  );

  console.log(dataArray);
  const indexCount = dataArray.length;
  const vertsText = verts.join("\n");
  const texesText = texes.join("\n");
  const normalsText = normals.join("\n");
  console.table(normals);
  return `
  unsigned int ${name}VertexCount = ${indexCount};
  float ${name}Vertices[] = {
    ${vertsText}
  };
  float ${name}VertexNormals[] = {
    ${normalsText}
  };
  float ${name}TexCoords[] = {
    ${texesText}
  };
  `;
};

const getTex = (text) => {
  const dataLeftTrim = text.slice(text.indexOf("vt "));
  const data2 = dataLeftTrim.slice(
    0,
    dataLeftTrim.search(/[^vt \d\r\n,.\-]|v(?!t)/i)
  );
  const data = data2
    .replace(/\r\n/g, "")
    .replace(/\n/g, "")
    .replace(/vt/g, "")
    .trim()
    .split(" ");
  console.log(data2);
  return data;
};

// const getTex = (text) => {
//   const data = text
//     .slice(text.indexOf("vt "), text.indexOf("vn "))
//     .replace(/\r\n/g, "")
//     .replace(/\n/g, "")
//     .replace(/vt/g, "")
//     .trim()
//     .split(" ");
//   return data;
// };

const getVertexNormals = (text) => {
  const dataLeftTrim = text.slice(text.indexOf("vn "));
  const dataArray = dataLeftTrim
    .slice(0, dataLeftTrim.search(/[^vn \d\r\n,.\-]|v(?!n)/i))
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/vn/g, "0.0")
    .trim()
    .split(" ");
  const data = dataArray.slice(1);
  data.push("0.0");
  return data;
};

// const getVertexNormals = (text) => {
//   const dataArray = text
//     .slice(text.indexOf("vn "), text.indexOf("usemtl"))
//     .replace(/\r\n/g, " ")
//     .replace(/\n/g, " ")
//     .replace(/vn/g, "0.0")
//     .trim()
//     .split(" ");
//   const data = dataArray.slice(1);
//   data.push("0.0");
//   return data;
// };

button.addEventListener("click", (e) => {
  getTheFile();
});
saveButton.addEventListener("click", (e) => {
  saveFile();
});
