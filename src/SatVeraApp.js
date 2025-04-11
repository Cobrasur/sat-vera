import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";

function SatVeraApp() {
  // Estados de autenticación y navegación
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("inicio");
  const [time, setTime] = useState(new Date());
  const [rememberEmail, setRememberEmail] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Variables para estilos condicionales  
  // Para ambas modalidades el texto será negro
  const panelBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = "text-black";

  // Estados para formulario de nuevo servicio
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [valor, setValor] = useState(""); // ej.: "40.000"
  const [fechaAtencion, setFechaAtencion] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Estados para campos extras en Nuevo Servicio
  const [urgente, setUrgente] = useState(false);
  const [notasAdicionales, setNotasAdicionales] = useState("");
  const [materiales, setMateriales] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  // Estados para técnicos y servicios (estructura ampliada)
  const [tecnicos, setTecnicos] = useState(() => {
    const data = localStorage.getItem("tecnicos");
    return data ? JSON.parse(data) : [];
  });
  const [nuevoTecnico, setNuevoTecnico] = useState("");
  const [telefonoTecnico, setTelefonoTecnico] = useState("");
  const [fotoTecnico, setFotoTecnico] = useState("");
  const [direccionTecnico, setDireccionTecnico] = useState("");
  const [disponibilidadTecnico, setDisponibilidadTecnico] = useState("");
  const [whatsappTecnico, setWhatsappTecnico] = useState("");

  const [servicios, setServicios] = useState(() => {
    const data = localStorage.getItem("servicios");
    return data ? JSON.parse(data) : [];
  });

  // Estados para edición de servicios y técnicos
  const [editingIndex, setEditingIndex] = useState(null);
  const [editServiceData, setEditServiceData] = useState(null);
  const [editingTecnicoIndex, setEditingTecnicoIndex] = useState(null);
  const [editTecnicoData, setEditTecnicoData] = useState(null);

  // Estados para Finanzas: rango de fechas
  const [financeFrom, setFinanceFrom] = useState("");
  const [financeTo, setFinanceTo] = useState("");

  // useEffect para actualizar reloj y cargar correo recordado
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberEmail(true);
    }
    return () => clearInterval(interval);
  }, []);

  // Función para formatear números a formato CLP (sin decimales)
  const formatCurrency = (num) => {
    return num.toLocaleString("es-CL", { maximumFractionDigits: 0 });
  };

  // Al perder el foco en "valor"
  const handleValorBlur = () => {
    if (valor === "") return;
    const numericValue = parseInt(valor.replace(/\D/g, ""), 10);
    if (!isNaN(numericValue)) {
      setValor(formatCurrency(numericValue));
    }
  };

  // Función de login
  const handleLogin = () => {
    if (email === "admin@satvera.cl" && password === "1234") {
      setLoggedIn(true);
      setError("");
      if (rememberEmail) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    setLoggedIn(false);
    setEmail("");
    setPassword("");
  };

  // Toggle para modo oscuro (para ambos modos el texto será negro)
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Guardar un nuevo servicio (se inserta al inicio)
  const handleGuardarServicio = () => {
    const tecnicoSel = tecnicos.find((t) => t.nombre === tecnico);
    if (!tecnicoSel) return alert("Selecciona un técnico válido.");
    const nuevo = {
      nombre,
      direccion,
      telefono,
      descripcion,
      tecnico,
      telefonoTecnico: tecnicoSel.telefono,
      valor,
      fechaAtencion,
      estado: "Pendiente",
      urgente,
      notasAdicionales,
      materiales,
      ubicacion,
      fecha: new Date().toLocaleString()
    };
    const actualizados = [nuevo, ...servicios];
    setServicios(actualizados);
    localStorage.setItem("servicios", JSON.stringify(actualizados));
    // Limpiar campos
    setNombre("");
    setDireccion("");
    setTelefono("");
    setDescripcion("");
    setTecnico("");
    setValor("");
    setFechaAtencion("");
    setUrgente(false);
    setNotasAdicionales("");
    setMateriales("");
    setUbicacion("");
    alert("Servicio guardado correctamente.");
  };

  // Agregar técnico (estructura extendida)
  const handleAgregarTecnico = () => {
    if (nuevoTecnico && telefonoTecnico) {
      const nuevoTec = {
        nombre: nuevoTecnico,
        telefono: telefonoTecnico,
        foto: fotoTecnico,
        direccion: direccionTecnico,
        disponibilidad: disponibilidadTecnico,
        whatsapp: whatsappTecnico
      };
      const actualizado = [...tecnicos, nuevoTec];
      setTecnicos(actualizado);
      localStorage.setItem("tecnicos", JSON.stringify(actualizado));
      // Limpiar campos
      setNuevoTecnico("");
      setTelefonoTecnico("");
      setFotoTecnico("");
      setDireccionTecnico("");
      setDisponibilidadTecnico("");
      setWhatsappTecnico("");
    }
  };

  // Función para generar y descargar el PDF de la orden de servicio
  const handleDownloadPDF = (serv) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Orden de Servicio", 20, 20);
    doc.setFontSize(12);
    doc.text("Empresa: Servicios Vera", 20, 30);
    doc.text(`Cliente: ${serv.nombre}`, 20, 40);
    doc.text(`Dirección: ${serv.direccion}`, 20, 50);
    doc.text(`Teléfono: ${serv.telefono}`, 20, 60);
    doc.text(`Descripción: ${serv.descripcion}`, 20, 70);
    doc.text(`Técnico: ${serv.tecnico}`, 20, 80);
    doc.text(`Tel. Técnico: ${serv.telefonoTecnico}`, 20, 90);
    doc.text(`Valor: ${serv.valor}`, 20, 100);
    doc.text(`Fecha de Atención: ${serv.fechaAtencion}`, 20, 110);
    doc.text(`Fecha de Ingreso: ${serv.fecha}`, 20, 120);
    doc.save(`OrdenServicio_${serv.nombre}.pdf`);
  };

  // Compartir con el técnico por WhatsApp
  const compartirConTecnico = (serv) => {
    const message = `Hola ${serv.tecnico}, tienes un nuevo servicio generado:
👤 Cliente: ${serv.nombre}
📍 Dirección: ${serv.direccion}
📞 Teléfono: ${serv.telefono}
📝 Descripción: ${serv.descripcion}
💰 Valor: ${serv.valor}
📅 Fecha: ${serv.fechaAtencion ? serv.fechaAtencion : serv.fecha}
${serv.notasAdicionales ? `🗒️ Notas: ${serv.notasAdicionales}` : ""}
${serv.materiales ? `🔧 Materiales: ${serv.materiales}` : ""}
${serv.ubicacion ? `🗺️ Ubicación: ${serv.ubicacion}` : ""}
`;
    window.open(
      `https://wa.me/${serv.telefonoTecnico.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const compartirConCliente = (serv) => {
    const horaAtencion = serv.fechaAtencion ? serv.fechaAtencion.slice(11) : "";
    const message = `Hola ${serv.nombre}, informamos desde Servicios Vera que el técnico ${serv.tecnico} irá a tu domicilio a las ${horaAtencion}. Favor confirmar.`;
    window.open(
      `https://wa.me/${serv.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // Actualizar estado de un servicio
  const updateServiceStatus = (index, newStatus) => {
    const updatedServices = servicios.map((serv, i) => {
      if (i === index) {
        return { ...serv, estado: newStatus };
      }
      return serv;
    });
    setServicios(updatedServices);
    localStorage.setItem("servicios", JSON.stringify(updatedServices));
  };

  // Función para editar un servicio
  const handleStartEdit = (index) => {
    const enteredPassword = prompt("Ingrese la contraseña para editar");
    if (enteredPassword !== "1234") {
      alert("Contraseña incorrecta.");
      return;
    }
    setEditingIndex(index);
    setEditServiceData({ ...servicios[index] });
  };

  const handleEditChange = (field, value) => {
    setEditServiceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = () => {
    const tecnicoSel = tecnicos.find((t) => t.nombre === editServiceData.tecnico);
    if (!tecnicoSel) {
      alert("Selecciona un técnico válido.");
      return;
    }
    const updatedService = {
      ...editServiceData,
      telefonoTecnico: tecnicoSel.telefono
    };
    const updatedServices = servicios.map((serv, i) =>
      i === editingIndex ? updatedService : serv
    );
    setServicios(updatedServices);
    localStorage.setItem("servicios", JSON.stringify(updatedServices));
    setEditingIndex(null);
    setEditServiceData(null);
    alert("Edición guardada correctamente.");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditServiceData(null);
  };

  const handleDeleteService = (index) => {
    const enteredPassword = prompt("Ingrese la contraseña para eliminar");
    if (enteredPassword !== "1234") {
      alert("Contraseña incorrecta.");
      return;
    }
    const updatedServices = servicios.filter((_, i) => i !== index);
    setServicios(updatedServices);
    localStorage.setItem("servicios", JSON.stringify(updatedServices));
    alert("Servicio eliminado.");
  };

  // Función para editar técnico
  const handleStartEditTecnico = (index) => {
    const enteredPassword = prompt("Ingrese la contraseña para editar técnico");
    if (enteredPassword !== "1234") {
      alert("Contraseña incorrecta.");
      return;
    }
    setEditingTecnicoIndex(index);
    setEditTecnicoData({ ...tecnicos[index] });
  };

  const handleEditTecnicoChange = (field, value) => {
    setEditTecnicoData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEditTecnico = () => {
    const updatedTecnicos = tecnicos.map((tec, i) =>
      i === editingTecnicoIndex ? editTecnicoData : tec
    );
    setTecnicos(updatedTecnicos);
    localStorage.setItem("tecnicos", JSON.stringify(updatedTecnicos));
    setEditingTecnicoIndex(null);
    setEditTecnicoData(null);
    alert("Técnico editado correctamente.");
  };

  const handleCancelEditTecnico = () => {
    setEditingTecnicoIndex(null);
    setEditTecnicoData(null);
  };

  const handleDeleteTecnico = (index) => {
    const enteredPassword = prompt("Ingrese la contraseña para eliminar técnico");
    if (enteredPassword !== "1234") {
      alert("Contraseña incorrecta.");
      return;
    }
    const updatedTecnicos = tecnicos.filter((_, i) => i !== index);
    setTecnicos(updatedTecnicos);
    localStorage.setItem("tecnicos", JSON.stringify(updatedTecnicos));
    alert("Técnico eliminado.");
  };

  // --- Renderizado de la pestaña TÉCNICOS ---
  const renderTecnicosTab = () => {
    return (
      <div className="flex gap-4">
        {/* Formulario para agregar técnico */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-2">Agregar Técnico</h2>
          <input
            className="w-full p-2 border rounded mb-2"
            placeholder="Nombre del técnico"
            value={nuevoTecnico}
            onChange={(e) => setNuevoTecnico(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded mb-2"
            placeholder="Teléfono"
            value={telefonoTecnico}
            onChange={(e) => setTelefonoTecnico(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded mb-2"
            placeholder="URL de la foto"
            value={fotoTecnico}
            onChange={(e) => setFotoTecnico(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded mb-2"
            placeholder="Dirección"
            value={direccionTecnico}
            onChange={(e) => setDireccionTecnico(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded mb-2"
            placeholder="Disponibilidad Horaria"
            value={disponibilidadTecnico}
            onChange={(e) => setDisponibilidadTecnico(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded mb-2"
            placeholder="WhatsApp"
            value={whatsappTecnico}
            onChange={(e) => setWhatsappTecnico(e.target.value)}
          />
          <button
            onClick={handleAgregarTecnico}
            className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
          >
            Agregar Técnico
          </button>
        </div>
        {/* Lista de técnicos */}
        <div className="bg-white rounded-xl shadow p-6 flex-1">
          <h2 className="text-xl font-bold mb-2">Técnicos Registrados</h2>
          {tecnicos.length === 0 ? (
            <p>No hay técnicos registrados.</p>
          ) : (
            tecnicos.map((tec, i) =>
              editingTecnicoIndex === i && editTecnicoData ? (
                <div key={i} className="border p-2 rounded mb-2">
                  <input
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Nombre"
                    value={editTecnicoData.nombre}
                    onChange={(e) => handleEditTecnicoChange("nombre", e.target.value)}
                  />
                  <input
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Teléfono"
                    value={editTecnicoData.telefono}
                    onChange={(e) => handleEditTecnicoChange("telefono", e.target.value)}
                  />
                  <input
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Dirección"
                    value={editTecnicoData.direccion}
                    onChange={(e) => handleEditTecnicoChange("direccion", e.target.value)}
                  />
                  <input
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Disponibilidad"
                    value={editTecnicoData.disponibilidad}
                    onChange={(e) => handleEditTecnicoChange("disponibilidad", e.target.value)}
                  />
                  <input
                    className="w-full p-2 border rounded mb-2"
                    placeholder="WhatsApp"
                    value={editTecnicoData.whatsapp}
                    onChange={(e) => handleEditTecnicoChange("whatsapp", e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEditTecnico} className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                      Guardar
                    </button>
                    <button onClick={handleCancelEditTecnico} className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div key={i} className="border p-2 rounded mb-2 flex items-center gap-2">
                  {tec.foto ? (
                    <img src={tec.foto} alt={tec.nombre} className="w-12 h-12 object-cover rounded-full" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full" />
                  )}
                  <div className="flex justify-between items-center w-full">
                    <span>{tec.nombre} - {tec.telefono}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleStartEditTecnico(i)} className="bg-green-600 text-white px-2 py-1 rounded">
                        Editar Técnico
                      </button>
                      <button onClick={() => handleDeleteTecnico(i)} className="bg-red-600 text-white px-2 py-1 rounded">
                        Eliminar Técnico
                      </button>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    );
  };

  // --- Renderizado de la pestaña INICIO ---
  const renderInicioTab = () => {
    const totalServices = servicios.length;
    const completedServices = servicios.filter(s => s.estado === "Terminado").length;
    const porcentajeCompletados = totalServices > 0 ? ((completedServices / totalServices) * 100).toFixed(1) : 0;
    const hoy = new Date().toISOString().split("T")[0];
    const serviciosHoy = servicios.filter(
      (s) => s.fechaAtencion && s.fechaAtencion.slice(0, 10) === hoy
    );
    const serviciosOtros = servicios.filter(
      (s) => !s.fechaAtencion || s.fechaAtencion.slice(0, 10) !== hoy
    );
    return (
      <div className="space-y-4">
        {/* Reloj y fecha */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold">{time.toLocaleTimeString()}</div>
          <div className="text-xl">{time.toLocaleDateString()}</div>
        </div>
        {/* Sección de 3 botones que ocupan el 75% del ancho */}
        <div className="w-3/4 mx-auto flex gap-4 my-4">
          <button onClick={() => window.open("https://ads.google.com/intl/es_CL/home/", "_blank")}
            className="flex-1 bg-blue-200 hover:bg-blue-300 px-4 py-2 rounded">
            ADS GOOGLE
          </button>
          <button onClick={() => window.open("http://www.2x3.cl", "_blank")}
            className="flex-1 bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded">
            2x3.cl
          </button>
          <button onClick={() => window.open("https://www.facebook.com/marketplace/you/selling", "_blank")}
            className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
            MARKETPLACE
          </button>
        </div>
        {/* Estadísticas */}
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-sm">Servicios Totales: {totalServices}</p>
          <p className="text-sm">Terminados: {porcentajeCompletados}%</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white rounded-xl shadow p-6 flex-1">
            <h2 className="text-xl font-bold mb-2">Servicios para hoy</h2>
            {serviciosHoy.length === 0 ? (
              <p>No hay servicios para hoy.</p>
            ) : (
              serviciosHoy.map((s, i) => {
                const serviceTime = new Date(s.fechaAtencion);
                const diffMinutes = (serviceTime - new Date()) / 60000;
                return (
                  <div key={i} className="border p-2 rounded mb-2 relative">
                    <p>
                      <b>Cliente:</b> {s.nombre}{" "}
                      {s.urgente && <span className="text-red-600 font-bold">¡Urgente!</span>}
                    </p>
                    <p><b>Atención:</b> {s.fechaAtencion}</p>
                    {diffMinutes > 0 && diffMinutes <= 60 && (
                      <span className="absolute top-1 right-1 bg-orange-200 text-xs p-1 rounded">
                        Próximo a comenzar
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex-1">
            <h2 className="text-xl font-bold mb-2">Servicios para otros días</h2>
            {serviciosOtros.length === 0 ? (
              <p>No hay servicios para otros días.</p>
            ) : (
              serviciosOtros.map((s, i) => (
                <div key={i} className="border p-2 rounded mb-2">
                  <p><b>Cliente:</b> {s.nombre}</p>
                  <p><b>Atención:</b> {s.fechaAtencion}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- Renderizado de la pestaña NUEVO SERVICIO ---
  const renderNuevoServicioTab = () => {
    return (
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <input className="w-full p-2 border rounded" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <select className="w-full p-2 border rounded" value={tecnico} onChange={(e) => setTecnico(e.target.value)}>
          <option value="">Selecciona técnico</option>
          {tecnicos.map((t, i) => (
            <option key={i} value={t.nombre}>{t.nombre}</option>
          ))}
        </select>
        <input
          className="w-full p-2 border rounded"
          placeholder="Valor (CLP)"
          value={valor}
          onChange={(e) => setValor(e.target.value.replace(/\D/g, ""))}
          onBlur={handleValorBlur}
        />
        <input className="w-full p-2 border rounded" type="datetime-local" placeholder="Fecha y hora de atención" value={fechaAtencion} onChange={(e) => setFechaAtencion(e.target.value)} />
        <label className="flex items-center">
          <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
          <span className="ml-2">Servicio Urgente</span>
        </label>
        <input className="w-full p-2 border rounded" placeholder="Notas adicionales" value={notasAdicionales} onChange={(e) => setNotasAdicionales(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Materiales necesarios" value={materiales} onChange={(e) => setMateriales(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Ubicación (coordenadas o link de Maps)" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
        <button onClick={handleGuardarServicio} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Guardar Servicio
        </button>
      </div>
    );
  };

  // --- Renderizado de la pestaña SERVICIOS ---
  const renderServiciosTab = () => {
    return (
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        {/* Leyenda de estados */}
        <div className="flex gap-4 mb-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="bg-red-600 text-white px-2 py-1 rounded">Pendiente</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded">En Curso</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-green-600 text-white px-2 py-1 rounded">Terminado</span>
          </div>
        </div>
        <input
          className="w-full p-2 border rounded"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {servicios.filter((s) => s.nombre.includes(busqueda)).map((s, i) => (
          <div key={i} className="border p-4 rounded bg-gray-50">
            {editingIndex === i && editServiceData ? (
              <div className="space-y-4">
                <input className="w-full p-2 border rounded" placeholder="Nombre" value={editServiceData.nombre} onChange={(e) => handleEditChange("nombre", e.target.value)} />
                <input className="w-full p-2 border rounded" placeholder="Dirección" value={editServiceData.direccion} onChange={(e) => handleEditChange("direccion", e.target.value)} />
                <input className="w-full p-2 border rounded" placeholder="Teléfono" value={editServiceData.telefono} onChange={(e) => handleEditChange("telefono", e.target.value)} />
                <input className="w-full p-2 border rounded" placeholder="Descripción" value={editServiceData.descripcion} onChange={(e) => handleEditChange("descripcion", e.target.value)} />
                <select className="w-full p-2 border rounded" value={editServiceData.tecnico} onChange={(e) => handleEditChange("tecnico", e.target.value)}>
                  <option value="">Selecciona técnico</option>
                  {tecnicos.map((t, j) => (
                    <option key={j} value={t.nombre}>{t.nombre}</option>
                  ))}
                </select>
                <input className="w-full p-2 border rounded" placeholder="Valor" value={editServiceData.valor} onChange={(e) => handleEditChange("valor", e.target.value)} />
                <input className="w-full p-2 border rounded" type="datetime-local" placeholder="Fecha y hora de atención" value={editServiceData.fechaAtencion} onChange={(e) => handleEditChange("fechaAtencion", e.target.value)} />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleSaveEdit} className="bg-green-600 text-white px-3 py-1 rounded">Guardar Edición</button>
                  <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-3 py-1 rounded">Cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                <p><b>Cliente:</b> {s.nombre}</p>
                <p><b>Dirección:</b> {s.direccion}</p>
                <p><b>Teléfono:</b> {s.telefono}</p>
                <p><b>Descripción:</b> {s.descripcion}</p>
                <p><b>Técnico:</b> {s.tecnico}</p>
                <p><b>Tel. Técnico:</b> {s.telefonoTecnico}</p>
                <p><b>Valor:</b> {s.valor}</p>
                <p><b>Fecha y hora de atención:</b> {s.fechaAtencion}</p>
                <p><b>Fecha de ingreso:</b> {s.fecha}</p>
                <p className="mt-1 text-sm">
                  <b>Estado:</b> <span className={
                    s.estado === "Pendiente"
                      ? "text-red-600"
                      : s.estado === "En Curso"
                      ? "text-yellow-500"
                      : "text-green-600"
                  }>{s.estado}</span>
                </p>
                <div className="mt-2">
                  <select
                    value={s.estado}
                    onChange={(e) => updateServiceStatus(i, e.target.value)}
                    className="p-1 border rounded text-xs"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Curso">En Curso</option>
                    <option value="Terminado">Terminado</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => compartirConTecnico(s)} className="bg-blue-600 text-white px-3 py-1 rounded">
                    Compartir Técnico
                  </button>
                  <button onClick={() => compartirConCliente(s)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                    Compartir Cliente
                  </button>
                  <button onClick={() => handleStartEdit(i)} className="bg-green-600 text-white px-3 py-1 rounded">
                    Editar
                  </button>
                  <button onClick={() => handleDeleteService(i)} className="bg-red-600 text-white px-3 py-1 rounded">
                    Eliminar
                  </button>
                  <button onClick={() => handleDownloadPDF(s)} className="bg-indigo-600 text-white px-3 py-1 rounded">
                    Descargar PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // --- Renderizado de la pestaña FINANZAS ---
  const renderFinanzasTab = () => {
    const filteredServices = servicios.filter((s) => {
      if (!s.fechaAtencion) return false;
      const serviceDate = s.fechaAtencion.slice(0, 10);
      if (financeFrom && serviceDate < financeFrom) return false;
      if (financeTo && serviceDate > financeTo) return false;
      return true;
    });
    // Se reparte el valor: mitad para SAT y mitad para el técnico
    const totalValue = filteredServices.reduce(
      (sum, s) => sum + (parseFloat(s.valor.replace(/\./g, "")) || 0),
      0
    );
    const totalSAT = totalValue / 2;
    const totalesTecnicos = {};
    filteredServices.forEach((s) => {
      const tech = s.tecnico;
      const val = parseFloat(s.valor.replace(/\./g, "")) || 0;
      if (tech) {
        totalesTecnicos[tech] = (totalesTecnicos[tech] || 0) + val / 2;
      }
    });
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-2">Finanzas Generales</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="date"
              className="p-2 border rounded"
              value={financeFrom}
              onChange={(e) => setFinanceFrom(e.target.value)}
              placeholder="Desde"
            />
            <input
              type="date"
              className="p-2 border rounded"
              value={financeTo}
              onChange={(e) => setFinanceTo(e.target.value)}
              placeholder="Hasta"
            />
          </div>
          <p className="text-lg font-bold">
            Total SAT: ${formatCurrency(totalSAT)} CLP
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {tecnicos.length === 0 ? (
            <p className="w-full">No hay técnicos registrados.</p>
          ) : (
            tecnicos.map((tec, i) => {
              const monto = totalesTecnicos[tec.nombre] || 0;
              return (
                <div
                  key={i}
                  className="bg-white border rounded p-4 flex flex-col items-center"
                  style={{ width: "48%" }}
                >
                  {tec.foto ? (
                    <img src={tec.foto} alt={tec.nombre} className="w-20 h-20 object-cover rounded-full mb-2" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-300 rounded-full mb-2" />
                  )}
                  <p className="font-bold">{tec.nombre}</p>
                  <p className="text-sm">Tel: {tec.telefono}</p>
                  <p className="text-sm">Dir: {tec.direccion}</p>
                  <p className="text-sm">Disponibilidad: {tec.disponibilidad}</p>
                  <p className="text-sm">WhatsApp: {tec.whatsapp}</p>
                  <p className="mt-2 font-bold">Monto: ${formatCurrency(monto)} CLP</p>
                  <div className="mt-2 p-1 border rounded w-full text-center text-xs">
                    Calendario (días/semanas/años)
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Renderiza los tabs internos según activeTab
  const renderTab = () => {
    if (activeTab === "inicio") return renderInicioTab();
    if (activeTab === "nuevo") return renderNuevoServicioTab();
    if (activeTab === "servicios") return renderServiciosTab();
    if (activeTab === "tecnicos") return renderTecnicosTab();
    if (activeTab === "finanzas") return renderFinanzasTab();
  };

  // Renderiza el contenido principal (menú horizontal)
  const renderMainContent = () => {
    return (
      <div className="w-3/4 mx-auto flex-1">
        <div className="flex justify-center gap-2 flex-wrap mb-6">
          <button onClick={() => setActiveTab("inicio")}
            className={activeTab === "inicio" ? "bg-blue-600 text-white px-4 py-2 rounded" : "bg-white px-4 py-2 rounded"}>
            Inicio
          </button>
          <button onClick={() => setActiveTab("nuevo")}
            className={activeTab === "nuevo" ? "bg-green-600 text-white px-4 py-2 rounded" : "bg-white px-4 py-2 rounded"}>
            Nuevo Servicio
          </button>
          <button onClick={() => setActiveTab("servicios")}
            className={activeTab === "servicios" ? "bg-blue-500 text-white px-4 py-2 rounded" : "bg-white px-4 py-2 rounded"}>
            Servicios
          </button>
          <button onClick={() => setActiveTab("tecnicos")}
            className={activeTab === "tecnicos" ? "bg-yellow-500 text-white px-4 py-2 rounded" : "bg-white px-4 py-2 rounded"}>
            Técnicos
          </button>
          <button onClick={() => setActiveTab("finanzas")}
            className={activeTab === "finanzas" ? "bg-purple-600 text-white px-4 py-2 rounded" : "bg-white px-4 py-2 rounded"}>
            Finanzas
          </button>
        </div>
        {renderTab()}
      </div>
    );
  };

  // Envolvemos el título en un recuadro de color bonito
  const headerComponent = (
    <div className="bg-purple-200 p-4 rounded-lg mb-6">
      <h1 className="text-3xl font-bold text-center">SAT VERA</h1>
    </div>
  );

  // Clases para el contenedor principal
  const outerClasses =
    "min-h-screen relative p-6 flex flex-col " +
    (darkMode
      ? "bg-gray-900 text-black"
      : "bg-gradient-to-br from-blue-500 via-green-400 to-yellow-300 text-black");

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-green-400 to-yellow-300">
        <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
          <h2 className="text-xl font-bold text-center text-blue-700 mb-4">Iniciar sesión</h2>
          <input className="w-full p-2 border rounded mb-3" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="flex items-center mb-3">
            <input type="checkbox" checked={rememberEmail} onChange={(e) => setRememberEmail(e.target.checked)} />
            <span className="ml-2 text-sm text-gray-600">Recordar correo</span>
          </label>
          <input className="w-full p-2 border rounded mb-3" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mt-2">
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={outerClasses}>
      {/* Botón Modo Oscuro */}
      <button onClick={toggleDarkMode} className="absolute top-4 left-4 bg-gray-500 text-white px-3 py-1 rounded">
        {darkMode ? "Modo Claro" : "Modo Oscuro"}
      </button>
      {/* Botón Cerrar Sesión */}
      <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded">
        Cerrar sesión
      </button>
      {headerComponent}
      {renderMainContent()}
      <footer className="mt-6 text-center">
        copyright ® SAT VERA - Todos los derechos reservados - www.serviciosvera.cl - Alvaro Cardenas
      </footer>
    </div>
  );
}

export default SatVeraApp;
