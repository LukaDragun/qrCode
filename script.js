window.onload = function () {
  var array = [];
  var selectedFields = [];

  var makeCodesAndDownload = function () {
    if (
      !array ||
      array.length <= 0 ||
      !selectedFields ||
      selectedFields.length <= 0
    )
      return;
    let texts = array.map((textItem) =>
      selectedFields.reduce(
        (acc, key, index) =>
          acc +
          textItem[key] +
          (index === selectedFields.length - 1 ? "" : " / "),
        ""
      )
    );
    let codes = [];

    texts.forEach((item) => {
      let qr = new QRious({
        value: item,
      });
      codes.push(qr.toDataURL());
    });

    if (codes.length > 0) {
      var zip = new JSZip();
      codes.forEach((item, index) => {
        zip.file(index + 1 + ".png", urlToPromise(item), { base64: true });
      });
      zip.generateAsync({ type: "blob" }).then(function callback(blob) {
        // see FileSaver.js
        saveAs(blob, "items.zip");
      });
    }
  };

  var parseExcel = function (file) {
    var reader = new FileReader();
    let fieldSelector = document.querySelector("#field-selector");

    document.getElementById("options").style.visibility = "hidden";
    clear();
    fieldSelector.innerHTML = "";

    reader.onload = function (e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: "binary",
      });

      workbook.SheetNames.forEach(function (sheetName) {
        // Here is your object
        var XL_row_object = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName]
        );
        var json_object = JSON.stringify(XL_row_object)
          .replaceAll("\\n", " ")
          .replaceAll("[š", "s")
          .replaceAll("[ž", "z")
          .replaceAll("[đ", "d")
          .replaceAll("[č", "c")
          .replaceAll("[ć", "c")
          .replaceAll("[Š", "S")
          .replaceAll("[Đ", "D")
          .replaceAll("[Ć", "C")
          .replaceAll("[Č", "C")
          .replaceAll("[Ž", "Z");

        if (json_object.length) {
          document.getElementById("options").style.visibility = "visible";
          array = JSON.parse(json_object);
          let keys = Object.keys(array[0]);

          keys.forEach((item) => {
            // creating checkbox element
            var button = document.createElement("button");
            button.innerHTML = item;
            button.onclick = () => addField(item);
            fieldSelector.appendChild(button);
          });
        }
      });
    };

    reader.onerror = function (ex) {
      console.log(ex);
    };

    reader.readAsBinaryString(file);
  };

  var addField = function (field) {
    selectedFields.push(field);
    document.querySelector("#selectedText").innerHTML = selectedFields.reduce(
      (acc, item) => acc + " / " + item
    );
  };

  var clear = function () {
    selectedFields = [];
    document.querySelector("#selectedText").innerHTML = "";
  };

  var pullfiles = function () {
    // love the query selector
    var fileInput = document.querySelector("#fileUpload");
    var files = fileInput.files;
    // cache files.length
    var fl = files.length;
    var i = 0;

    while (i < fl) {
      // localize file var in the loop
      var file = files[i];
      if (file) parseExcel(file);
      i++;
    }
  };

  function urlToPromise(url) {
    return new Promise(function (resolve, reject) {
      JSZipUtils.getBinaryContent(url, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  document.getElementById("options").style.visibility = "hidden";
  document.getElementById("fileUpload").onchange = pullfiles;
  document
    .getElementById("download")
    .addEventListener("click", makeCodesAndDownload);
  document.getElementById("clear").addEventListener("click", clear);
};
