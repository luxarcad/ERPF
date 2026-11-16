# Nexo · ERP académico

Propuesta navegable en React + Vite para Ingeniería en Gestión Empresarial. Se desarrolla en `C:/httdocs/Fabian/demo`. No usa backend, base de datos, cuentas reales ni servicios externos para procesar archivos.

## Iniciar

Probada con Node.js 24.12.0 y npm 11.6.2.

```powershell
cd C:/httdocs/Fabian/demo
npm install
npm run dev
```

Abre la dirección que imprima Vite. La configuración actual conserva `base: '/ERPF/'`, por lo que normalmente será `http://localhost:5173/ERPF/`.

Las dependencias adicionales ya están registradas e instaladas. El comando equivalente para agregarlas a una copia inicial es:

```powershell
npm install echarts lucide-react motion matter-js exceljs @fontsource/dm-sans @fontsource/manrope
```

Conserva `package-lock.json` y la sustitución de `uuid` dentro de `overrides` en `package.json`. Para reproducir exactamente la instalación usa `npm ci`.

## Qué puedes presentar

- Profesor/superadmin: supervisión de todas las empresas, creación de equipos, finanzas, revisión de documentos e integrantes.
- Administrador: espacio de su empresa, edición de roles del equipo, importación y revisión de documentos.
- Gerente: indicadores, documentos y seguimiento de actividades de su empresa.
- Financiero: importación de Excel y análisis de ingresos, egresos, resultado neto y margen.
- Empleado: documentos, integrantes y actividades de su empresa.
- Seis empresas ficticias y 42 alumnos; cada equipo tiene entre 6 y 8 personas. Las nuevas empresas empiezan sin movimientos.
- Filtros por empresa, mes, estado y categoría; búsqueda de empresas, documentos y secciones.
- Exportación de resultados a CSV compatible con Excel.
- Actividades que se pueden completar y reabrir; registro de acciones de la sesión.
- Diseño para escritorio y tablets desde 768 px. Las tablas anchas tienen desplazamiento horizontal dentro de su sección. No se diseñó una versión para smartphones.

El selector «Vista de profesor» permite explorar los cinco roles. Es una simulación de la interfaz, no un mecanismo de autorización.

## Recorrido sugerido

1. Abre Vista general y consulta el resumen ejecutivo, las tendencias y la rentabilidad de las seis empresas.
2. Filtra una empresa y cambia el mes para comparar resultados.
3. Abre Documentos, descarga la plantilla e impórtala desde «Importar Excel».
4. Revisa los cuatro movimientos antes de confirmar. La plantilla aporta $73,000 en ingresos y $20,500 en egresos.
5. Comprueba los nuevos indicadores en Finanzas. Explora Resultados, Presupuesto y Capital de trabajo. Los registros importados se suman a los datos de ejemplo de su empresa y mes.
6. Cambia de rol y observa el espacio de un alumno.
7. Completa una actividad mediante «Acciones» y comprueba el filtro Completadas.
8. En Configuración puedes reiniciar la demostración manteniendo presionado el botón de confirmación.

## Análisis empresarial

Los gráficos usan Apache ECharts con renderizado SVG, información al pasar el cursor, leyendas interactivas y una tabla alternativa por gráfico. El botón de información explica la fórmula o el origen de los datos sin ocupar espacio permanente. Las animaciones respetan la preferencia de movimiento reducido.

- Resumen ejecutivo: ingresos, resultado neto, margen neto y caja, con comparación mensual y minigráficos de tendencia.
- Ingresos y egresos: líneas y áreas de mayo al periodo seleccionado; cada empresa tiene una evolución distinta.
- Composición de egresos: dona por categoría, cuya suma coincide con el gasto total.
- Flujo de caja: cascada de saldo inicial, ingresos, egresos y saldo final; admite saldos negativos.
- Rentabilidad: barras horizontales por empresa; selección con clic o desde la tabla. Al filtrar una empresa muestra sus márgenes mensuales.
- Resultado y margen: gráfico combinado de barras y línea con escalas independientes en MXN y porcentaje.
- Presupuesto: barras agrupadas de gasto real y planeado; naranja para sobrecostos, más cumplimiento de metas de ingresos con referencia al 100%.
- Capital de trabajo: cartera por cobrar y pagar con barras apiladas según vencimiento.

El resultado es ingresos menos egresos. El margen divide ese resultado entre los ingresos. Las variaciones porcentuales requieren un periodo anterior positivo; la variación del margen se expresa en puntos porcentuales. Los importes se acumulan en centavos para reconciliar totales y detalle.

La caja es un **modelo simplificado**: capital inicial de ejemplo (28% del ingreso base de cada empresa) más el flujo acumulado desde mayo. No equivale a un estado contable completo. Los presupuestos, categorías de gastos iniciales y saldos por vencimiento son escenarios ilustrativos. Las importaciones actualizan ingresos, egresos, resultado y caja; los nuevos egresos quedan en «Sin clasificar». No cambian los presupuestos ni la cartera, porque la plantilla no contiene facturas o fechas de vencimiento. Las empresas nuevas empiezan con cero saldos y sin metas.

Las tablas de resultados por empresa y movimientos importados se despliegan bajo demanda. El encabezado, menú y resumen eliminan mensajes promocionales y explicaciones repetidas. Los componentes de React Bits permanecen integrados.

## Importación de Excel

Acepta `.xlsx` de hasta 5 MB y 5,000 movimientos. Lee la primera hoja y requiere estos encabezados, sin importar mayúsculas:

| Columna  | Valor                                                          |
| -------- | -------------------------------------------------------------- |
| Fecha    | Fecha de Excel o texto AAAA-MM-DD, de agosto a octubre de 2026 |
| Concepto | Texto de 1 a 180 caracteres                                    |
| Tipo     | Ingreso o Egreso                                               |
| Monto    | Celda numérica mayor que cero, sin símbolos ni fórmulas        |

La demo valida la estructura, fechas y montos antes de importar. No calcula fórmulas; deben pegarse como valores en Excel. Rechaza un archivo ya importado con el mismo nombre, tamaño y fecha de modificación para la misma empresa durante la sesión. Los archivos nunca se envían a un servidor.

Los 24 documentos iniciales son referencias ficticias. Sus descargas generan hojas ilustrativas de movimientos; no representan los saldos de las empresas. Los documentos importados muestran sus movimientos reales. Los porcentajes de avance académico y el estado de las empresas son ejemplos fijos, no calificaciones ni valores calculados a partir de las tareas.

## Persistencia y alcance

Todos los cambios se guardan solo en memoria: recargar la pestaña restaura los ejemplos. El contexto del aula está situado en octubre de 2026. No hay colaboración simultánea, autenticación, almacenamiento de archivos, calificaciones, contabilidad oficial ni permisos de servidor.

Las preferencias de interfaz incluyen botones de ayuda en gráficos y filas compactas. La interfaz no envía correos, mensajes ni invitaciones.

## Componentes compartidos

Se integraron los cinco componentes de React Bits aportados en los archivos de referencia:

| Componente                                  | Uso                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| FolderFloat (el archivo nombrado undefined) | Carpetas en Documentos; apertura por clic y física desactivada en esta demo |
| HoldButton                                  | Confirmación al reiniciar la sesión                                         |
| JellyRadio                                  | Vistas financieras y filtros de empresas, documentos y actividades          |
| SquishSwitch                                | Preferencias de Configuración                                               |
| SwipeRow                                    | Acciones de actividades, también disponibles mediante un botón visible      |

Están en `src/components/react-bits`. Se conservaron sus estilos y animaciones, se tradujeron los textos utilizados, se sustituyó Hugeicons por Lucide y se adaptó la sincronización de referencias a React 19. Las excepciones puntuales de ESLint están comentadas junto a los patrones imperativos de animación; las reglas generales del proyecto siguen activas. La acción de SwipeRow se registra antes de su animación para no perderla al cambiar de vista.

Referencias: [React Bits](https://reactbits.dev/), [ExcelJS](https://github.com/exceljs/exceljs), [Lucide](https://lucide.dev/), [Motion](https://motion.dev/).

## Estructura

- `src/App.jsx`: navegación, estado de la demo y vistas.
- `src/data.js`: empresas, alumnos y datos de ejemplo; cálculo de indicadores.
- `src/components/UI.jsx`: elementos visuales comunes.
- `src/components/Analytics.jsx` y `Analytics.css`: indicadores y vistas financieras.
- `src/components/ChartCanvas.jsx`: ECharts, redimensionado, accesibilidad y movimiento reducido.
- `src/lib/analytics.js`: categorías, presupuestos, caja e indicadores del escenario.
- `src/components/Dialogs.jsx`: importación, empresas, roles y confirmaciones.
- `src/lib/spreadsheets.js`: lectura, validación y descarga de Excel.
- `tests/spreadsheets.test.js`: pruebas de archivos y métricas.
- `tests/analytics.test.js`: conciliación entre gráficos, importaciones, caja, presupuestos y casos sin actividad o con pérdidas.

Las fuentes se empaquetan localmente. Analítica, ExcelJS y FolderFloat se cargan en módulos separados. ECharts registra solo los gráficos y componentes utilizados. ECharts y ExcelJS todavía generan archivos de JavaScript mayores de 500 kB; Vite muestra una advertencia de tamaño que no impide compilar. ExcelJS no se descarga en la pantalla inicial.

## Verificación y compilación

```powershell
npm run lint
npm test
npm run build
npm run preview
```

`dist/` contiene la versión estática. La ruta de despliegue actual es `/ERPF/`; si cambia el destino, ajusta `base` en `vite.config.js` y vuelve a compilar. Esta tarea no publica ni despliega el proyecto.

Las pruebas automatizadas verifican lectura de XLSX, redondeo, fechas, columnas, rechazo de fórmulas, archivos vacíos o inválidos, límites de tamaño/filas, aislamiento por empresa/periodo y margen cuando no hay ingresos.

## Por definir con el profesor

Antes del sistema real: permisos definitivos por rol, creación y cierre de cursos, rúbricas, catálogo contable, tipos de Excel, reglas para duplicados, históricos, periodos de trabajo, separación de empresas, auditoría y política de almacenamiento.
