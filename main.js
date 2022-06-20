let current_blob = "";

const button = document.querySelector("#button");
const saveButton = document.querySelector("#saveButton");

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
  const faces = getFaces(text, name, texValues, normalValues);
  const final = `${verts}
  ${faces} `;
  current_blob = final;
};

const getVerts = (text, name) => {
  const dataArray = text
    .slice(text.indexOf("v "), text.indexOf("vt "))
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/v/g, "1.0")
    .trim()
    .split(" ");
  const vertsCount = dataArray.length / 4;
  const data = dataArray.slice(1).join("f, ");

  return `
  int ${name}VertexCount = ${vertsCount};
  float ${name}Vertices[] = {
    ${data}f, 1.0f,
  };`;
};

const getFaces = (text, name, texValues, normalValues) => {
  const dataArray = text
    .slice(text.indexOf("f "))
    .replace(/\r\n/g, "")
    .replace(/\n/g, "")
    .replace(/f/g, "")
    .trim()
    .split(" ");

  const faces = dataArray.map((el) => el.split("/")[0]);
  const texIndexes = dataArray.map((el) => el.split("/")[1]);
  const normalIndexes = dataArray.map((el) => el.split("/")[2]);
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
  const texesText = texes.join("\n");
  const normalsText = normals.join("\n");
  const facesText = faces.join(", ");
  console.table(normals);
  return `
  int ${name}indexCount = ${indexCount};
  float ${name}Indexes[] = {
    ${facesText},
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
  const data = text
    .slice(text.indexOf("vt "), text.indexOf("vn "))
    .replace(/\r\n/g, "")
    .replace(/\n/g, "")
    .replace(/vt/g, "")
    .trim()
    .split(" ");
  return data;
};

const getVertexNormals = (text) => {
  const dataArray = text
    .slice(text.indexOf("vn "), text.indexOf("usemtl"))
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/vn/g, "0.0")
    .trim()
    .split(" ");
  const data = dataArray.slice(1);
  data.push("0.0");
  return data;
};

button.addEventListener("click", (e) => {
  getTheFile();
});
saveButton.addEventListener("click", (e) => {
  saveFile();
});
