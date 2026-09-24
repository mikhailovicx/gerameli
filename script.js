(function(){
  "use strict";

  /* ---------- pengaturan ---------- */
  var WA_NUMBER = "62895389751177";
  var SHIPPING  = 8000;
  var FREE_FROM = 50000;

  /* foto asli menu — file-nya ada di folder images/.
     Kosongkan nilainya ("") untuk kembali memakai ilustrasi bawaan. */
  var FOTO = {
    "gor-og":  "images/gor-og.jpg",
    "bas-ped": "images/bas-ped.jpg",
    "bas-spe": "images/bas-spe.jpg"
  };

  var MENU = [
    { id:"gor-og",  nama:"Lumpia Goreng OG",        kat:"goreng",  harga:10000, tag:"Paling laris",
      desc:"Kulit renyah, isian bengkuang dan telur dengan bumbu asli warung.",
      art:{bg:"#FAE3C9", plate:"#F1DCB4", roll:"#E0A552", dark:"#C98634", leaf:"#2E7D4F"} },
    { id:"bas-ped", nama:"Lumpia Basah Pedas",      kat:"basah",   harga:12000, tag:"Pedas",
      desc:"Kulit lembut disiram sambal racikan. Pedasnya bisa diatur.",
      art:{bg:"#F8D6C6", plate:"#F3C2AC", roll:"#E8845A", dark:"#C1512B", leaf:"#C1372B"} },
    { id:"bas-spe", nama:"Lumpia Basah Spesial",    kat:"basah",   harga:15000, tag:"Porsi besar",
      desc:"Isian dobel dengan telur, sosis, dan saus spesial.",
      art:{bg:"#FBEBC4", plate:"#F3DC9E", roll:"#EFBE6C", dark:"#D09A34", leaf:"#2E7D4F"} },
    { id:"gor-pem", nama:"Lumpia Goreng Pedas Manis", kat:"goreng", harga:12000, tag:"",
      desc:"Lumpia goreng dengan saus pedas manis yang lengket di kulit.",
      art:{bg:"#F7DCC0", plate:"#EFCBA4", roll:"#D98A3C", dark:"#B5641F", leaf:"#C1372B"} },
    { id:"pkt-b2",  nama:"Paket Berdua (4 pcs)",    kat:"paket",   harga:38000, tag:"Hemat Rp6rb",
      desc:"Dua lumpia goreng, dua lumpia basah, plus dua es teh manis.",
      art:{bg:"#E4EFDD", plate:"#CFE3C4", roll:"#E0A552", dark:"#C98634", leaf:"#2E7D4F"} },
    { id:"min-est", nama:"Es Teh Manis",            kat:"minuman", harga:5000, tag:"",
      desc:"Teh tubruk, gula secukupnya, es batu penuh. Teman wajib lumpia.",
      art:{bg:"#DCE9EF", plate:"#C3D9E3", roll:"#B07535", dark:"#8A5622", leaf:"#2E7D4F"} }
  ];

  MENU.forEach(function(m){ if(FOTO[m.id]) m.foto = FOTO[m.id]; });

  var FILTERS = [
    { id:"semua",   label:"Semua menu" },
    { id:"basah",   label:"Lumpia basah" },
    { id:"goreng",  label:"Lumpia goreng" },
    { id:"paket",   label:"Paket" },
    { id:"minuman", label:"Minuman" }
  ];

  /* ---------- penyimpanan lokal (tanpa database) ---------- */
  var K = { cart:"lumpia.cart", users:"lumpia.users", sesi:"lumpia.sesi", order:"lumpia.pesanan." };

  var store = {
    get:function(key, fallback){
      try{
        var raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      }catch(e){ return fallback; }
    },
    set:function(key, value){
      try{ localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch(e){ return false; }
    },
    del:function(key){ try{ localStorage.removeItem(key); }catch(e){} }
  };

  /* ---------- alat bantu ---------- */
  var $ = function(sel){ return document.querySelector(sel); };
  var rupiah = function(n){ return "Rp" + new Intl.NumberFormat("id-ID").format(n); };
  var esc = function(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c];
    });
  };
  var byId = function(id){
    for(var i=0;i<MENU.length;i++){ if(MENU[i].id === id) return MENU[i]; }
    return null;
  };
  var initial = function(nama){ return (nama || "?").trim().charAt(0).toUpperCase(); };

  /* sandi disamarkan sederhana — bukan pengamanan sungguhan, hanya agar tidak terbaca polos */
  function samarkan(teks){
    var h = 5381, i;
    for(i = 0; i < teks.length; i++){ h = ((h << 5) + h + teks.charCodeAt(i)) >>> 0; }
    return "s" + h.toString(36) + "-" + teks.length;
  }

  function toast(pesan){
    var box = $("#toasts");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = pesan;
    box.appendChild(el);
    setTimeout(function(){
      el.style.transition = "opacity .3s ease";
      el.style.opacity = "0";
      setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 2600);
  }

  /* ---------- media menu: foto asli kalau ada, kalau tidak pakai ilustrasi ---------- */
  function media(m){
    if(m.foto){
      return '<img src="'+m.foto+'" alt="'+esc(m.nama)+'" loading="lazy">';
    }
    return gambar(m.art, m.kat === "minuman");
  }

  /* ---------- ilustrasi menu ---------- */
  function gambar(a, minuman){
    if(minuman){
      return '<svg viewBox="0 0 400 250" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
        '<rect width="400" height="250" fill="'+a.bg+'"/>' +
        '<circle cx="200" cy="140" r="120" fill="'+a.plate+'" opacity=".8"/>' +
        '<path d="M150 70h100l-12 130a14 14 0 0 1-14 12h-48a14 14 0 0 1-14-12z" fill="'+a.roll+'"/>' +
        '<path d="M154 92h92l-4 44h-84z" fill="#fff" opacity=".28"/>' +
        '<rect x="142" y="60" width="116" height="14" rx="7" fill="'+a.dark+'"/>' +
        '<rect x="228" y="28" width="12" height="46" rx="6" fill="'+a.dark+'" transform="rotate(12 234 51)"/>' +
        '<circle cx="180" cy="118" r="12" fill="#fff" opacity=".45"/>' +
        '<circle cx="214" cy="146" r="9" fill="#fff" opacity=".35"/>' +
      '</svg>';
    }
    return '<svg viewBox="0 0 400 250" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="400" height="250" fill="'+a.bg+'"/>' +
      '<circle cx="200" cy="140" r="118" fill="#FFFFFF" opacity=".55"/>' +
      '<circle cx="200" cy="140" r="98" fill="'+a.plate+'"/>' +
      '<path d="M92 150c26-30 60-34 82-30-10 28-40 48-82 30z" fill="'+a.leaf+'"/>' +
      '<g transform="translate(200 138)">' +
        '<g transform="rotate(-13) translate(0 26)">' +
          '<rect x="-84" y="-20" width="168" height="40" rx="20" fill="'+a.roll+'"/>' +
          '<rect x="-84" y="-20" width="32" height="40" rx="16" fill="'+a.dark+'"/>' +
          '<rect x="52" y="-20" width="32" height="40" rx="16" fill="'+a.dark+'"/>' +
        '</g>' +
        '<g transform="rotate(8) translate(4 -12)">' +
          '<rect x="-90" y="-21" width="180" height="42" rx="21" fill="'+a.roll+'"/>' +
          '<rect x="-90" y="-21" width="34" height="42" rx="17" fill="'+a.dark+'"/>' +
          '<rect x="56" y="-21" width="34" height="42" rx="17" fill="'+a.dark+'"/>' +
          '<path d="M-34-21c7 14 7 28 0 42M10-21c7 14 7 28 0 42" stroke="'+a.dark+'" stroke-width="3" fill="none" opacity=".6"/>' +
        '</g>' +
        '<g transform="rotate(-3) translate(-2 -50)">' +
          '<rect x="-72" y="-18" width="144" height="36" rx="18" fill="'+a.roll+'" opacity=".92"/>' +
          '<rect x="-72" y="-18" width="28" height="36" rx="14" fill="'+a.dark+'"/>' +
          '<rect x="44" y="-18" width="28" height="36" rx="14" fill="'+a.dark+'"/>' +
        '</g>' +
      '</g>' +
      '<g stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" fill="none" opacity=".5">' +
        '<path d="M170 52c-10-12 10-18 0-32"/><path d="M204 44c-11-13 11-21 0-36"/><path d="M238 52c-10-12 10-18 0-32"/>' +
      '</g>' +
    '</svg>';
  }

  /* ---------- keranjang ---------- */
  var cart = store.get(K.cart, []);
  if(!Array.isArray(cart)) cart = [];

  function simpanCart(){ store.set(K.cart, cart); }

  function jumlahItem(){
    return cart.reduce(function(t, i){ return t + i.qty; }, 0);
  }
  function subtotal(){
    return cart.reduce(function(t, i){
      var m = byId(i.id);
      return t + (m ? m.harga * i.qty : 0);
    }, 0);
  }
  function ongkir(){
    var s = subtotal();
    return (s === 0 || s >= FREE_FROM) ? 0 : SHIPPING;
  }

  function tambah(id){
    var ada = null;
    for(var i=0;i<cart.length;i++){ if(cart[i].id === id) ada = cart[i]; }
    if(ada){ ada.qty += 1; } else { cart.push({ id:id, qty:1 }); }
    simpanCart(); renderCart();
  }
  function ubahQty(id, delta){
    for(var i=0;i<cart.length;i++){
      if(cart[i].id === id){
        cart[i].qty += delta;
        if(cart[i].qty <= 0) cart.splice(i,1);
        break;
      }
    }
    simpanCart(); renderCart();
  }
  function hapus(id){
    cart = cart.filter(function(i){ return i.id !== id; });
    simpanCart(); renderCart();
  }

  function renderCart(){
    var badge = $("#cartCount");
    var n = jumlahItem();
    badge.textContent = n;
    badge.classList.toggle("on", n > 0);

    var body = $("#cartBody");
    var foot = $("#cartFoot");

    if(!cart.length){
      body.innerHTML =
        '<div class="empty">' +
          '<div class="big" aria-hidden="true">🧺</div>' +
          '<h3>Keranjang masih kosong</h3>' +
          '<p>Pilih lumpia di daftar menu, nanti rinciannya muncul di sini.</p>' +
          '<p style="margin-top:14px"><button class="btn btn--dark" id="toMenu">Lihat menu</button></p>' +
        '</div>';
      foot.hidden = true;
      var b = $("#toMenu");
      if(b) b.addEventListener("click", function(){
        tutupKeranjang();
        var t = document.getElementById("menu");
        if(t) t.scrollIntoView({ behavior:"smooth" });
      });
      return;
    }

    var html = "";
    cart.forEach(function(item){
      var m = byId(item.id);
      if(!m) return;
      html +=
        '<div class="cart-line">' +
          '<div class="cart-thumb">' + media(m) + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div class="nm">' + esc(m.nama) + '</div>' +
            '<div class="pr">' + rupiah(m.harga) + ' / porsi</div>' +
            '<div class="qty">' +
              '<button type="button" data-act="minus" data-id="'+m.id+'" aria-label="Kurangi '+esc(m.nama)+'">−</button>' +
              '<span>' + item.qty + '</span>' +
              '<button type="button" data-act="plus" data-id="'+m.id+'" aria-label="Tambah '+esc(m.nama)+'">+</button>' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right;display:flex;flex-direction:column;justify-content:space-between">' +
            '<div class="line-total">' + rupiah(m.harga * item.qty) + '</div>' +
            '<button class="drop" type="button" data-act="drop" data-id="'+m.id+'">hapus</button>' +
          '</div>' +
        '</div>';
    });
    body.innerHTML = html;
    foot.hidden = false;

    var sub = subtotal(), kirim = ongkir();
    $("#sumQty").textContent = jumlahItem() + " item";
    $("#sumSub").textContent = rupiah(sub);
    $("#sumShip").textContent = kirim === 0 ? "Gratis" : rupiah(kirim);
    $("#sumTotal").textContent = rupiah(sub + kirim);
    $("#cartMeta").textContent = jumlahItem() + " item · belum dikirim";
  }

  /* ---------- daftar menu ---------- */
  function renderFilters(){
    var box = $("#filters");
    box.innerHTML = FILTERS.map(function(f, i){
      return '<button class="filter" type="button" data-kat="'+f.id+'" aria-pressed="'+(i===0)+'">'+f.label+'</button>';
    }).join("");
  }

  function renderMenu(kat){
    var grid = $("#menuGrid");
    var list = MENU.filter(function(m){ return kat === "semua" || m.kat === kat; });
    grid.innerHTML = list.map(function(m){
      return '<article class="dish">' +
        '<div class="dish-media">' + media(m) +
          (m.tag ? '<span class="dish-tag">'+esc(m.tag)+'</span>' : '') +
        '</div>' +
        '<div class="dish-body">' +
          '<h3>' + esc(m.nama) + '</h3>' +
          '<p>' + esc(m.desc) + '</p>' +
          '<div class="dish-foot">' +
            '<div class="price">' + rupiah(m.harga) + '<small>per porsi</small></div>' +
            '<button class="add-btn" type="button" data-add="'+m.id+'">+ Tambah</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  /* ---------- panel & modal ---------- */
  var panelTerbuka = null;

  function bukaKeranjang(){
    $("#cartPanel").classList.add("on");
    $("#cartPanel").setAttribute("aria-hidden","false");
    $("#scrim").classList.add("on");
    document.body.style.overflow = "hidden";
    panelTerbuka = "cart";
  }
  function tutupKeranjang(){
    $("#cartPanel").classList.remove("on");
    $("#cartPanel").setAttribute("aria-hidden","true");
    $("#scrim").classList.remove("on");
    document.body.style.overflow = "";
    panelTerbuka = null;
  }
  function bukaModal(){
    $("#authModal").classList.add("on");
    $("#authModal").setAttribute("aria-hidden","false");
    $("#scrim").classList.add("on");
    document.body.style.overflow = "hidden";
    panelTerbuka = "auth";
  }
  function tutupModal(){
    $("#authModal").classList.remove("on");
    $("#authModal").setAttribute("aria-hidden","true");
    $("#scrim").classList.remove("on");
    document.body.style.overflow = "";
    panelTerbuka = null;
  }

  /* ---------- akun (localStorage) ---------- */
  function daftarUser(){ var u = store.get(K.users, {}); return (u && typeof u === "object") ? u : {}; }
  function userAktif(){
    var email = store.get(K.sesi, null);
    if(!email) return null;
    var u = daftarUser()[email];
    return u ? { email:email, nama:u.nama } : null;
  }

  function perbaruiTombolAkun(){
    var u = userAktif();
    var btn = $("#accountBtn");
    if(u){
      btn.innerHTML = '<span class="avatar">'+esc(initial(u.nama))+'</span><span class="label">'+esc(u.nama.split(" ")[0])+'</span>';
    }else{
      btn.innerHTML = '<span aria-hidden="true">👤</span><span class="label">Masuk</span>';
    }
  }

  function tampilFormAkun(mode){
    var body = $("#authBody");
    var u = userAktif();

    if(u){
      var pesanan = store.get(K.order + u.email, []);
      var riwayat = "";
      if(!pesanan.length){
        riwayat = '<p style="color:var(--muted);font-size:.9rem">Belum ada pesanan tersimpan. Pesanan yang kamu kirim lewat keranjang akan tercatat di sini.</p>';
      }else{
        riwayat = pesanan.slice().reverse().map(function(o){
          return '<div class="order-item">' +
            '<div class="meta"><span>'+esc(o.tanggal)+'</span><span>'+rupiah(o.total)+'</span></div>' +
            '<ul>' + o.item.map(function(it){ return '<li>'+esc(it)+'</li>'; }).join("") + '</ul>' +
          '</div>';
        }).join("");
      }
      body.innerHTML =
        '<div class="acct-head">' +
          '<span class="avatar">'+esc(initial(u.nama))+'</span>' +
          '<span><b>'+esc(u.nama)+'</b><span>'+esc(u.email)+'</span></span>' +
        '</div>' +
        '<h3 style="font-size:1rem">Riwayat pesanan</h3>' +
        riwayat +
        '<button class="btn btn--ghost btn--block" id="logoutBtn" style="margin-top:16px">Keluar dari akun</button>' +
        '<p class="note" style="margin:16px 0 0">Akun ini tersimpan di browser kamu saja, bukan di server. Kalau data browser dibersihkan, akunnya ikut hilang.</p>';

      $("#logoutBtn").addEventListener("click", function(){
        store.del(K.sesi);
        perbaruiTombolAkun();
        tampilFormAkun("masuk");
        toast("Kamu sudah keluar");
      });
      $("#authTitle").textContent = "Akun kamu";
      return;
    }

    $("#authTitle").textContent = "Masuk atau daftar";
    var isMasuk = mode !== "daftar";
    body.innerHTML =
      '<div class="tabs" role="tablist">' +
        '<button type="button" role="tab" data-mode="masuk" aria-selected="'+isMasuk+'">Masuk</button>' +
        '<button type="button" role="tab" data-mode="daftar" aria-selected="'+(!isMasuk)+'">Daftar</button>' +
      '</div>' +
      '<p class="note">Akun disimpan di browser ini saja (localStorage), tanpa database dan tanpa server. Fungsinya untuk menyimpan nama dan riwayat pesanan — jangan pakai sandi yang kamu pakai di tempat lain.</p>' +
      '<p class="err" id="authErr"></p>' +
      (isMasuk ? "" :
        '<div class="field"><label for="fNama">Nama</label><input id="fNama" type="text" placeholder="Nama kamu" autocomplete="name"></div>') +
      '<div class="field"><label for="fEmail">Email</label><input id="fEmail" type="email" placeholder="nama@email.com" autocomplete="email"></div>' +
      '<div class="field"><label for="fSandi">Kata sandi</label><input id="fSandi" type="password" placeholder="Minimal 6 karakter" autocomplete="'+(isMasuk?"current-password":"new-password")+'"></div>' +
      '<button class="btn btn--block" id="authSubmit">'+(isMasuk ? "Masuk" : "Buat akun")+'</button>';

    Array.prototype.forEach.call(body.querySelectorAll("[data-mode]"), function(btn){
      btn.addEventListener("click", function(){ tampilFormAkun(btn.getAttribute("data-mode")); });
    });

    body.querySelector("#authSubmit").addEventListener("click", function(){
      var err  = $("#authErr");
      var email = ($("#fEmail").value || "").trim().toLowerCase();
      var sandi = $("#fSandi").value || "";
      var nama  = isMasuk ? "" : ($("#fNama") ? ($("#fNama").value || "").trim() : "");

      function gagal(pesan){ err.textContent = pesan; err.classList.add("on"); }
      err.classList.remove("on");

      if(!isMasuk && nama.length < 2) return gagal("Isi nama kamu dulu, minimal 2 huruf.");
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return gagal("Format emailnya belum benar.");
      if(sandi.length < 6) return gagal("Kata sandi minimal 6 karakter.");

      var users = daftarUser();

      if(isMasuk){
        if(!users[email]) return gagal("Email ini belum terdaftar di browser ini. Daftar dulu, ya.");
        if(users[email].sandi !== samarkan(sandi)) return gagal("Kata sandinya belum cocok.");
        store.set(K.sesi, email);
        toast("Selamat datang lagi, " + users[email].nama.split(" ")[0]);
      }else{
        if(users[email]) return gagal("Email ini sudah terdaftar. Coba masuk saja.");
        users[email] = { nama:nama, sandi:samarkan(sandi), dibuat:Date.now() };
        if(!store.set(K.users, users)) return gagal("Browser kamu menolak menyimpan data. Coba matikan mode penyamaran.");
        store.set(K.sesi, email);
        toast("Akun dibuat. Halo, " + nama.split(" ")[0] + "!");
      }

      perbaruiTombolAkun();
      var nm = $("#buyerName");
      if(nm && !nm.value){
        var ua = userAktif();
        if(ua) nm.value = ua.nama;
      }
      tampilFormAkun();
    });

    Array.prototype.forEach.call(body.querySelectorAll("input"), function(inp){
      inp.addEventListener("keydown", function(e){
        if(e.key === "Enter"){ e.preventDefault(); body.querySelector("#authSubmit").click(); }
      });
    });
  }

  /* ---------- kirim pesanan ---------- */
  function checkout(){
    if(!cart.length) return;
    var nama = ($("#buyerName").value || "").trim();
    if(!nama){
      $("#buyerName").focus();
      toast("Isi nama pemesan dulu ya");
      return;
    }
    var catatan = ($("#buyerNote").value || "").trim();
    var sub = subtotal(), kirim = ongkir(), total = sub + kirim;

    var baris = [];
    cart.forEach(function(item){
      var m = byId(item.id);
      if(m) baris.push(m.nama + " x" + item.qty + " = " + rupiah(m.harga * item.qty));
    });

    var teks = "Halo Kak, saya mau pesan:\n\n" + baris.join("\n") +
      "\n\nSubtotal: " + rupiah(sub) +
      "\nOngkir: " + (kirim === 0 ? "Gratis" : rupiah(kirim)) +
      "\nTotal: " + rupiah(total) +
      "\n\nNama: " + nama +
      (catatan ? "\nCatatan: " + catatan : "");

    var u = userAktif();
    if(u){
      var riwayat = store.get(K.order + u.email, []);
      if(!Array.isArray(riwayat)) riwayat = [];
      riwayat.push({
        tanggal: new Date().toLocaleString("id-ID", { dateStyle:"medium", timeStyle:"short" }),
        item: baris,
        total: total
      });
      store.set(K.order + u.email, riwayat.slice(-20));
    }

    window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(teks), "_blank", "noopener");

    cart = [];
    simpanCart();
    renderCart();
    $("#buyerNote").value = "";
    tutupKeranjang();
    toast(u ? "Pesanan dikirim dan disimpan di riwayat" : "Pesanan dikirim ke WhatsApp");
  }

  /* ---------- pasang semua ---------- */
  function init(){
    renderFilters();
    renderMenu("semua");
    renderCart();
    perbaruiTombolAkun();

    var ua = userAktif();
    if(ua) $("#buyerName").value = ua.nama;

    $("#year").textContent = new Date().getFullYear();

    // pita berjalan
    var kata = ["Gurih", "Pedas sesuai selera", "Digoreng dadakan", "Bahan belanja pagi", "Harga anak kos", "Antar Cimahi dan sekitarnya"];
    var isi = kata.map(function(k){ return "<span>" + k + " ✦</span>"; }).join("");
    $("#ribbon").innerHTML = isi + isi;

    // menu: tambah ke keranjang
    $("#menuGrid").addEventListener("click", function(e){
      var btn = e.target.closest("[data-add]");
      if(!btn) return;
      var m = byId(btn.getAttribute("data-add"));
      tambah(btn.getAttribute("data-add"));
      btn.textContent = "✓ Masuk keranjang";
      btn.classList.add("done");
      setTimeout(function(){ btn.textContent = "+ Tambah"; btn.classList.remove("done"); }, 1200);
      if(m) toast(m.nama + " masuk keranjang");
    });

    // saringan menu
    $("#filters").addEventListener("click", function(e){
      var btn = e.target.closest(".filter");
      if(!btn) return;
      Array.prototype.forEach.call(this.querySelectorAll(".filter"), function(b){
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      renderMenu(btn.getAttribute("data-kat"));
    });

    // aksi di dalam keranjang
    $("#cartBody").addEventListener("click", function(e){
      var btn = e.target.closest("[data-act]");
      if(!btn) return;
      var id = btn.getAttribute("data-id");
      var act = btn.getAttribute("data-act");
      if(act === "plus")  ubahQty(id, 1);
      if(act === "minus") ubahQty(id, -1);
      if(act === "drop")  hapus(id);
    });

    $("#cartBtn").addEventListener("click", bukaKeranjang);
    $("#cartClose").addEventListener("click", tutupKeranjang);
    $("#checkoutBtn").addEventListener("click", checkout);

    $("#accountBtn").addEventListener("click", function(){ tampilFormAkun(); bukaModal(); });
    $("#authClose").addEventListener("click", tutupModal);

    $("#scrim").addEventListener("click", function(){
      if(panelTerbuka === "cart") tutupKeranjang();
      if(panelTerbuka === "auth") tutupModal();
    });
    document.addEventListener("keydown", function(e){
      if(e.key !== "Escape") return;
      if(panelTerbuka === "cart") tutupKeranjang();
      if(panelTerbuka === "auth") tutupModal();
    });

    // navigasi ponsel
    var nav = $("#nav"), toggle = $("#navToggle");
    toggle.addEventListener("click", function(){
      var buka = nav.classList.toggle("on");
      toggle.setAttribute("aria-expanded", buka ? "true" : "false");
    });
    nav.addEventListener("click", function(e){
      if(e.target.tagName === "A"){
        nav.classList.remove("on");
        toggle.setAttribute("aria-expanded","false");
      }
    });

    // penyimpanan tidak tersedia
    try{
      localStorage.setItem("lumpia.tes","1");
      localStorage.removeItem("lumpia.tes");
    }catch(err){
      toast("Browser memblokir penyimpanan — keranjang tidak akan tersimpan saat halaman ditutup");
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  }else{
    init();
  }
})();
