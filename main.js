
//farkli js dosyalarindan gelen veriler
import { setStorage, getStorage, icons, userIcon,} from "./helpers.js";
//htmlden eleman cagirma
const form = document.querySelector("form");
const noteList = document.querySelector("ul");
const close = document.querySelector("#close");
const  open = document.querySelector("#open");
const aside = document.querySelector("aside");

//! global degiskenler(yani js nin her yerinden erisilebilen degiskenler olacak)
let coords;
let notes = getStorage() || []; // veriler null yerine bos dizi olsun
let markerLayer = [];
let map;


// haritayi ekrana yukleyen fonksiyon
function loadMap(coords) {
     map = L.map('map').setView(coords, 9);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//imleclelri tutatacagimiz ayri bir katman olusturma
markerLayer = L.layerGroup().addTo(map)

//kullanici konununa imlec basma
L.marker(coords, { icon: userIcon }).addTo(map);

//localden gelen verileri ekrana bas
renderNoteList(notes);

//harikadaki tiklanma olaylarini izle
map.on('click' , onMapClick);

}

//* kullanicinin konumunu bir kez alir
navigator.geolocation.getCurrentPosition(
    //konum alirsa calisacak fonksiyon, suanki konum bilgisi verildi
    (e) =>{
       loadMap([e.coords.latitude, e.coords.longitude])
    },
    //konum alinamazsa calisacak fonksiyon, varsayilan olarak NY turk konsoloslugu konumu verildi
    () => {
        loadMap([40.7513903,-73.9709598]);
    }
    );

    // haritadaki tiklanma aninda calisir
    function onMapClick(e) {
        console.log([e.latlng.lat, e.latlng.lng]);

        //tiklanan yerin konumuna eris. ve global degiskene atadik
        coords = [e.latlng.lat, e.latlng.lng];

        // haritada bir yere tiklandiginda form alanini gosterir
        form.style.display = "flex";

         // ilk input alanina focuslanir
        form[0].focus();
    }
    //cancel butonna tiklanirsa formu temizl ve kapat
    form[4].addEventListener('click',() =>{

        //formu temizleme
        form.reset();

        //formu kapatir
        form.style.display = 'none';
    });

    //form gonderilince yeni bir not olustur ve storage' e kaydet
    form.addEventListener('submit',(e)=> {
        e.preventDefault();
        //inputlardaki verilerden bir note objesi olustur.
        const newNote = {
            id: new Date().getTime(),
            title : form[0].value,
            date: form[1].value,
            status: form[2].value,
            coords:coords,
        };
        // dizinin basina yeni notu ekleme
        notes.unshift(newNote);
       
        // olusan notlari listeleme 
        renderNoteList(notes);

        //local staragei guncelleme
        setStorage(notes);

        //formu kapama
        form.style.display='none';
        form.reset();
    
        
    });

    //notlari ekrana basar
    function renderNoteList(items){
        // onceki elemanlari temizle
        noteList.innerHTML = "";
        markerLayer.clearLayers();

        //dizideki herbir obje icin not karti bas
        items.forEach((note) => {

            // li eleman olustur
            const listEle = document.createElement('li');

            //data-id ekle
            listEle.dataset.id = note.id;

            //icerigini belirle
            listEle.innerHTML = `
            <div class="info">
            <p class="title">${note.title}</p>
            <p>
                <span>Date:</span>
                <span>${note.date}</span>
            </p>
            <p>
                <span>Status:</span>
                <span>${note.status}</span>
            </p>
        </div>

       <div class="icons">
        <i id="fly" class="bi bi-airplane-fill"></i>
        <i id= "delete" class="bi bi-trash3-fill"></i>
       </div> 
            `;

            //elemani listeye ekle
            noteList.appendChild(listEle);

            //elemani haritaya ekle
            renderMarker(note);


        });

    }

    //not icin imlec katmanina yeni bir imlec ekler
    function renderMarker(note){
        //imlec olustur
        L.marker(note.coords, {icon: icons[note.status]})
        //imleci katmana ekle
        .addTo(markerLayer)
        .bindPopup(note.title)

    }

    //silme ve ucus
    noteList.addEventListener("click", (e) => {

        //tiklanna elemanin id sine ulasma
        const found_id = e.target.closest("li").dataset.id;
        if (e.target.id === 'delete' && 
        confirm('are you sure about "DELETE"')) {
            //id si bilinne elmani diziden cikarma
            notes = notes.filter((note) => note.id != found_id);

            //local i guncelle
            setStorage(notes);

            //ekrani guncelle
            renderNoteList(notes);
        }
        if (e.target.id === 'fly') {
            //id sini bildigimiz elemana diziden erisme
            const note = notes.find((note) => note.id == found_id);

            //notu'un coordinatlarina ucur
            map.flyTo(note.coords);
        }
    });

    // menu acma-kapama 
    open.addEventListener("click", ()=>{
        aside.classList.remove("hide")
        open.classList.add("hide")
        close.classList.remove("hide")
      })
      
      // not ekranını kapat
      close.addEventListener("click", ()=>{
        aside.classList.add("hide")
        close.classList.add("hide")
        open.classList.remove("hide")
      })
    




