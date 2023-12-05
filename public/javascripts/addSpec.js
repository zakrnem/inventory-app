const specList = document.querySelector(".spec-list");
const specsArray = [...specList.children]
let specCount = (specsArray.length > 2) ? specsArray.length-1 : 1 

specList.addEventListener("click", (e) => {
  e.preventDefault();

  if (e.target.id === "add-spec") {
    const prevAddSpecBtn = document.getElementById("add-spec");
    specList.removeChild(prevAddSpecBtn);

    specCount++
    const input = document.createElement("input");
    input.id = `spec${specCount}`;
    input.type = "text";
    input.name = `specification`;
    input.placeholder = `Specification #${specCount}`;

    const insertSpec = document.createElement("button");
    insertSpec.textContent = "+Add specification";
    insertSpec.id = `add-spec`;

    specList.append(input, insertSpec);
  }
});
