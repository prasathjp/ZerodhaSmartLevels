// ======================================================
// Zerodha Smart Levels
// Floating Dashboard
// ======================================================

(() => {

let dashboard;
let tableBody;
let header;
let minimizeBtn;

let minimized = false;

createDashboard();

window.addEventListener("zsl-data-updated", e => {

    renderStocks(e.detail.stocks);

});

function createDashboard(){

    dashboard=document.createElement("div");
    dashboard.id="zsl-dashboard";

    dashboard.innerHTML=`

        <div id="zsl-header">

            <span>📈 Smart Levels</span>

            <button id="zsl-minimize">−</button>

        </div>

        <table id="zsl-table">

            <thead>

                <tr>

                    <th>Stock</th>
                    <th>LTP</th>
                    <th>Day High</th>

                </tr>

            </thead>

            <tbody></tbody>

        </table>

    `;

    document.body.appendChild(dashboard);

    tableBody=dashboard.querySelector("tbody");

    header=dashboard.querySelector("#zsl-header");

    minimizeBtn=dashboard.querySelector("#zsl-minimize");

    makeDraggable();

    minimizeBtn.onclick=toggleDashboard;

}

 //-----------------------------------------------------
// Render Stocks
//-----------------------------------------------------

function renderStocks(stocks){

    if(!tableBody)
        return;

    tableBody.innerHTML="";

    const filtered=stocks.filter(s=>s.highlight);

    filtered.forEach(stock=>{

        const tr=document.createElement("tr");

        tr.className="zsl-dashboard-row";

        tr.innerHTML=`

            <td>${stock.symbol}</td>
            <td>${stock.price.toFixed(2)}</td>
            <td>${stock.dayHigh.toFixed(2)}</td>

        `;

        tr.onclick=()=>{

            stock.row.scrollIntoView({

                behavior:"smooth",

                block:"center"

            });

            stock.row.classList.add("zsl-flash");

            setTimeout(()=>{

                stock.row.classList.remove("zsl-flash");

            },1500);

        };

        tableBody.appendChild(tr);

    });

}

//-----------------------------------------------------
// Minimize / Expand
//-----------------------------------------------------

function toggleDashboard(){

    minimized=!minimized;

    const table=dashboard.querySelector("#zsl-table");

    if(minimized){

        table.style.display="none";

        minimizeBtn.textContent="+";

    }else{

        table.style.display="table";

        minimizeBtn.textContent="−";

    }

}

//-----------------------------------------------------
// Drag Support
//-----------------------------------------------------

function makeDraggable(){

    let dragging=false;

    let startX=0;

    let startY=0;

    let left=0;

    let top=0;

    header.addEventListener("mousedown",e=>{

        dragging=true;

        startX=e.clientX;

        startY=e.clientY;

        left=dashboard.offsetLeft;

        top=dashboard.offsetTop;

        dashboard.style.right="auto";

    });

    document.addEventListener("mousemove",e=>{

        if(!dragging)
            return;

        dashboard.style.left=
            left+(e.clientX-startX)+"px";

        dashboard.style.top=
            top+(e.clientY-startY)+"px";

    });

    document.addEventListener("mouseup",()=>{

        dragging=false;

    });

}

})();
