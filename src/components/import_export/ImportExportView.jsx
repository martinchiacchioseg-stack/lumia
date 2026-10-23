import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FileSpreadsheet, Upload, Download, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export function ImportExportView() {
  const { animales, adoptantes, bulkImportAnimals, bulkImportAdopters } = useData();

  const [importType, setImportType] = useState('animales'); // 'animales' | 'adoptantes'
  const [previewData, setPreviewData] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importSuccess, setImportSuccess] = useState(null);

  // Manejador de carga de archivo CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportSuccess(null);
    setParseErrors([]);
    setPreviewData([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  // Parser simple y robusto de CSV
  const parseCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setParseErrors(['El archivo no contiene suficientes filas (se requiere encabezado y al menos 1 registro).']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const rows = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length !== headers.length) {
        errors.push(`Fila ${i + 1}: El número de columnas no coincide con el encabezado.`);
        continue;
      }

      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx];
      });

      // Validación según tipo
      if (importType === 'animales') {
        if (!rowObj.nombre && !rowObj.nombre_actual) {
          errors.push(`Fila ${i + 1}: El nombre del animal es obligatorio.`);
        }
        rows.push({
          nombre_actual: rowObj.nombre || rowObj.nombre_actual || 'Rescatado',
          especie: (rowObj.especie || 'perro').toLowerCase(),
          sexo: (rowObj.sexo || 'hembra').toLowerCase(),
          tamano: (rowObj.tamano || 'mediano').toLowerCase(),
          estado_caso: (rowObj.estado || rowObj.estado_caso || 'rescatado').toLowerCase(),
          ubicacion_rescate: rowObj.ubicacion || rowObj.ubicacion_rescate || 'No especificada',
          notas_conducta: rowObj.notas || ''
        });
      } else {
        if (!rowObj.nombre && !rowObj.nombre_apellido) {
          errors.push(`Fila ${i + 1}: El nombre del adoptante es obligatorio.`);
        }
        if (!rowObj.telefono && !rowObj.telefono_whatsapp) {
          errors.push(`Fila ${i + 1}: El teléfono/WhatsApp es obligatorio.`);
        }
        rows.push({
          nombre_apellido: rowObj.nombre || rowObj.nombre_apellido || 'Adoptante',
          dni_cuit: rowObj.dni || rowObj.dni_cuit || '',
          telefono_whatsapp: rowObj.telefono || rowObj.telefono_whatsapp || '',
          direccion_barrio: rowObj.barrio || rowObj.localidad || 'Buenos Aires',
          tipo_vivienda: rowObj.tipo_vivienda || 'departamento',
          condicion_vivienda: 'propietario'
        });
      }
    }

    setParseErrors(errors);
    setPreviewData(rows);
  };

  const handleConfirmImport = () => {
    if (previewData.length === 0) return;

    if (importType === 'animales') {
      const count = bulkImportAnimals(previewData);
      setImportSuccess(`¡Se importaron ${count} animales con éxito!`);
    } else {
      const count = bulkImportAdopters(previewData);
      setImportSuccess(`¡Se importaron ${count} adoptantes con éxito!`);
    }

    setPreviewData([]);
  };

  // Exportar datos actuales a CSV
  const handleExportCSV = (tipo) => {
    let headers = [];
    let rows = [];

    if (tipo === 'animales') {
      headers = ['codigo_interno', 'nombre_actual', 'especie', 'sexo', 'edad_estimada', 'tamano', 'estado_caso', 'fecha_rescate'];
      rows = animales.map(a => [
        a.codigo_interno,
        `"${a.nombre_actual}"`,
        a.especie,
        a.sexo,
        a.edad_estimada,
        a.tamano,
        a.estado_caso,
        a.fecha_rescate
      ]);
    } else {
      headers = ['nombre_apellido', 'dni_cuit', 'telefono_whatsapp', 'direccion_barrio', 'tipo_vivienda', 'condicion_vivienda'];
      rows = adoptantes.map(ad => [
        `"${ad.nombre_apellido}"`,
        ad.dni_cuit,
        ad.telefono_whatsapp,
        `"${ad.direccion_barrio || ''}"`,
        ad.tipo_vivienda,
        ad.condicion_vivienda
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `patita_aliada_${tipo}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Descargar plantilla CSV de ejemplo
  const handleDownloadTemplate = () => {
    let templateContent = '';
    if (importType === 'animales') {
      templateContent = 'nombre,especie,sexo,tamano,estado,ubicacion,notas\nLuna,perro,hembra,mediano,rescatado,"Parque Avellaneda, CABA","Muy dulce y juguetona"\nMilo,gato,macho,chico,en adopción,"Plaza Flores, CABA","Ronronero y sociable"';
    } else {
      templateContent = 'nombre,dni,telefono,barrio,tipo_vivienda\nCarla Rossi,35442119,+5491155443322,Boedo,departamento\nPablo Gómez,31889452,+5491166778899,Palermo,casa con patio cerrado';
    }

    const encoded = encodeURI('data:text/csv;charset=utf-8,' + templateContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `plantilla_${importType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-patita-600" />
          <span>Importación y Exportación Masiva</span>
        </h1>
        <p className="text-xs text-stone-500">
          Migrá datos desde planillas Excel / Google Sheets o descargá respaldos en CSV
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Izquierdo: Importación con Validación Previa */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-patita-600" />
              <span>Importar desde Planilla (CSV)</span>
            </h2>
            <button
              onClick={handleDownloadTemplate}
              className="text-xs font-bold text-patita-600 hover:underline"
            >
              Descargar plantilla modelo
            </button>
          </div>

          {/* Selector de qué se importa */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setImportType('animales'); setPreviewData([]); setParseErrors([]); }}
              className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                importType === 'animales'
                  ? 'bg-patita-500 text-white border-patita-600 shadow-sm'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              Animales Rescatados
            </button>
            <button
              type="button"
              onClick={() => { setImportType('adoptantes'); setPreviewData([]); setParseErrors([]); }}
              className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                importType === 'adoptantes'
                  ? 'bg-patita-500 text-white border-patita-600 shadow-sm'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              Familias Adoptantes
            </button>
          </div>

          {/* File dropzone */}
          <label className="border-2 border-dashed border-stone-300 hover:border-patita-500 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition-colors">
            <Upload className="w-8 h-8 text-stone-400 mb-2" />
            <span className="text-xs font-bold text-stone-800">Elegí tu archivo .CSV o arrastralo acá</span>
            <span className="text-[11px] text-stone-400 mt-0.5">Compatible con exportaciones de Google Sheets y Excel</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Mensajes de error en parseo */}
          {parseErrors.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1 text-xs text-rose-800">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Se detectaron inconsistencias en el archivo:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] pl-1">
                {parseErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Mensaje de éxito */}
          {importSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{importSuccess}</span>
            </div>
          )}

          {/* Vista Previa de Validación */}
          {previewData.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">
                  Vista Previa ({previewData.length} registros listos)
                </span>
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar e Importar</span>
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Nombre</th>
                      <th className="p-2">{importType === 'animales' ? 'Especie' : 'WhatsApp'}</th>
                      <th className="p-2">{importType === 'animales' ? 'Estado' : 'Barrio'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {previewData.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-stone-400">{idx + 1}</td>
                        <td className="p-2 font-bold text-stone-800">
                          {row.nombre_actual || row.nombre_apellido}
                        </td>
                        <td className="p-2 text-stone-600">
                          {row.especie || row.telefono_whatsapp}
                        </td>
                        <td className="p-2 text-stone-600">
                          {row.estado_caso || row.direccion_barrio}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Panel Derecho: Respaldos y Exportación */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-patita-600" />
              <span>Exportar Base de Datos Completa</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Descargá tus datos en formatos estándar CSV para copias de seguridad</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-900">Listado Completo de Animales</h4>
                <p className="text-[11px] text-stone-500">Incluye códigos, estados, señas, vacunas y fechas</p>
              </div>
              <button
                onClick={() => handleExportCSV('animales')}
                className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-900">Padrón de Familias Adoptantes</h4>
                <p className="text-[11px] text-stone-500">Datos de contacto, viviendas y consentimientos</p>
              </div>
              <button
                onClick={() => handleExportCSV('adoptantes')}
                className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
