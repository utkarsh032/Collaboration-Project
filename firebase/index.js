// Initializing
let data = []; // Define globally
let avgAge = 0;
let avgSalary = 0;
let count = 0;
let sumAge = 0;
let sumSalary = 0;
const baseUrl = "https://masai-3ba93-default-rtdb.firebaseio.com/employees.json";

// Fetching from firebase
const requestOptions = {
  method: "GET",
  redirect: "follow",
};

fetch(baseUrl, requestOptions)
  .then((response) => response.json())
  .then((result) => {
    console.log(result);
    data = Object.values(result); // Store globally
    generateTableData(data);
  })
  .catch((error) => console.error(error));

// Display data
let flagSort = false;
let currCol = "";
function generateTableData(employees) {
  let tableRow = ``;
  let tableHead = `<tr>`;

  if (employees.length <= 0) {
    document.getElementById("tableBody").innerHTML = "List is empty";
    return;
  }

  Object.entries(employees[0]).forEach((element) => {
    tableHead += `<td>${element[0]}<button class="sort">sort</button></td>`;
  });
  tableHead += `</tr>`;
  document.getElementById("tableHead").innerHTML = tableHead;

  employees.forEach((element, rowIndex) => {
    if (element != null) {
      tableRow += `<tr>`;
      Object.entries(element).forEach((el, i, arr) => {
        if (i == arr.length - 1) {
          tableRow += `<td style="position:relative"><input type="text" class="inputDet" value="${el[1]}"> <button class="delRow">Delete</button></td>`;
        } else {
          tableRow += `<td><input type="text" class="inputDet" value="${el[1]}"></td>`;
        }
      });
      tableRow += `</tr>`;
    }
  });

  document.getElementById("tableBody").innerHTML = tableRow;

  // Add event listeners for change detection and row highlighting
  const inputFields = document.querySelectorAll(".inputDet");
  inputFields.forEach((input) => {
    input.addEventListener("input", () => {
      input.closest("tr").classList.add("highlight");
      setTimeout(() => {
        input.closest("tr").classList.remove("highlight");
      }, 2000); // Remove highlight after 2 seconds
    });
  });

  // Sorting event listeners
  const eventSort = document.querySelectorAll(".sort");
  eventSort.forEach((element) => {
    element.addEventListener("click", (obj) => {
      const colName = obj.target.previousSibling.textContent;
      if (flagSort === false && currCol === colName) {
        sortDataAsc(colName, data);
        currCol = colName;
        flagSort = true;
      } else if (flagSort === true && currCol === colName) {
        sortDataDesc(colName, data);
        flagSort = false;
        currCol = colName;
      } else {
        sortDataAsc(colName, data);
        currCol = colName;
        flagSort = true;
      }
    });
  });

  // Delete row event listeners
  const deleteRowEvent = document.querySelectorAll(".delRow");
  deleteRowEvent.forEach((el, i) => {
    el.addEventListener("click", (obj) => {
      deleteRow(obj, i);
    });
  });

  calcDetails(employees);
}


// Sort functions
function sortDataAsc(type, employees) {
  if (type === "id") {
    employees.sort((a, b) => a.id - b.id);
  } else if (type === "name") {
    employees.sort((a, b) => a.name.localeCompare(b.name));
  } else if (type === "age") {
    employees.sort((a, b) => a.age - b.age);
  } else if (type === "email") {
    employees.sort((a, b) => a.email.localeCompare(b.email));
  } else {
    employees.sort((a, b) => a.salary - b.salary);
  }
  generateTableData(employees);
}

function sortDataDesc(type, employees) {
  if (type === "id") {
    employees.sort((a, b) => b.id - a.id);
  } else if (type === "name") {
    employees.sort((a, b) => b.name.localeCompare(a.name));
  } else if (type === "age") {
    employees.sort((a, b) => b.age - a.age);
  } else if (type === "email") {
    employees.sort((a, b) => b.email.localeCompare(a.email));
  } else {
    employees.sort((a, b) => b.salary - a.salary);
  }
  generateTableData(employees);
}

// Filter function
function filter(employees) {
  const colSelect = document.querySelector("#filterSelect").value;
  const valueSelect = document.querySelector("#filterInput").value.trim();
  let newEmployees = [];

  if (colSelect && valueSelect) {
    // Updated to check for empty values
    if (colSelect === "id") {
      newEmployees = employees.filter((el) => el.id == valueSelect);
    } else if (colSelect === "name") {
      newEmployees = employees.filter((el) => el.name.toLowerCase() === valueSelect.toLowerCase());
    } else if (colSelect === "age") {
      newEmployees = employees.filter((el) => el.age == valueSelect);
    } else if (colSelect === "email") {
      newEmployees = employees.filter((el) => el.email.toLowerCase() === valueSelect.toLowerCase());
    } else if (colSelect === "salary") {
      newEmployees = employees.filter((el) => el.salary == valueSelect);
    }
  }

  generateTableData(newEmployees);
}

document.querySelector("#filter").addEventListener("click", () => {
  filter(data);
});

document.querySelector("#reset").addEventListener("click", () => {
  generateTableData(data);
});

document.querySelector("#clearLocal").addEventListener("click", () => {
  localStorage.removeItem("employees");
  generateTableData(data);
});

// Auto-save data to Firebase
const saveEmployeesToFirebase = async () => {
  document.getElementById("savingData").innerHTML = "Saving Data...";
  const requestOptions = {
    method: "PUT",
    body: JSON.stringify(data),
  };
  await fetch(baseUrl, requestOptions);
  setTimeout(() => {
    document.getElementById("savingData").innerHTML = "";
  }, 2000);
};

setInterval(() => {
  saveEmployeesToFirebase();
}, 7000);

// Calculation function
function calcDetails(employees) {
  // const sumAge = employees.reduce((acc, el) => (el ? acc + el.age : acc), 0);
  const sumSalary = employees.reduce((acc, el) => (el ? acc + el.salary : acc), 0);
  const count = employees.length;
  const avgAge = (sumAge / count).toFixed(2);
  const avgSalary = (sumSalary / count).toFixed(2);

  document.querySelector(
    "#salaryDetails"
  ).innerHTML = `Count: ${count},<br> Avg: ${avgSalary},<br> Total: ${sumSalary}`;
  // document.querySelector(
  //   "#ageDetails"
  // ).innerHTML = `Count: ${count},<br> Avg: ${avgAge},<br> Total: ${sumAge}`;
}

// Delete and Restore Functions
function deleteRow(obj, i) {
  const removed = data.splice(i, 1);
  generateTableData(data);
  document.querySelector("#restoreData").innerHTML = "Restore Row";
  document.querySelector("#restoreData").addEventListener("click", () => {
    restoreDeletedData(i, removed);
    document.querySelector("#restoreData").innerHTML = "";
  });
}

function restoreDeletedData(i, removed) {
  data.splice(i, 0, removed[0]);
  generateTableData(data);
}
