import calendar
from typing import List

def generar_sql_para_anio(year: int) -> List[str]:
    """
    Genera una lista de sentencias SQL INSERT para todos los días de un año específico.

    Esta función crea un registro para cada día del año, calculando los valores
    fiscales y de calendario correspondientes. La semana se reinicia cada mes.
    Maneja correctamente los años bisiestos.

    Args:
        year (int): El año para el cual se generarán los registros (ej: 2024).

    Returns:
        List[str]: Una lista de strings, donde cada string es una sentencia
                   SQL INSERT completa para un día.
    """
    registros_sql = []
    # Bucle por cada mes del año
    for mes in range(1, 13):
        trimestre = (mes - 1) // 3 + 1
        dias_en_mes = calendar.monthrange(year, mes)[1]
        
        semana_mes = 1
        dia_semana_contador = 0  # Contador de días dentro de la semana actual

        # Bucle por cada día del mes
        for dia in range(1, dias_en_mes + 1):
            # La semana se incrementa cada 7 días dentro del mismo mes
            dia_semana_contador += 1
            if dia_semana_contador > 7:
                semana_mes += 1
                dia_semana_contador = 1

            # Creación de los campos para la sentencia SQL
            dim_date_id = f"{year}{mes:02d}{dia:02d}"
            FullDate = f"{year}-{mes:02d}-{dia:02d}"
            Year = year
            Month = mes
            Week = semana_mes
            Day = dia
            
            # Formateo de la sentencia INSERT
            sql_statement = (
                f"INSERT INTO DIM_Date (DIM_DateId, FullDate, Year, Month, Week, Day) "
                f"VALUES ('{dim_date_id}', '{FullDate}', {Year}, {Month}, {Week}, {Day});"
            )
            
            registros_sql.append(sql_statement)

    return registros_sql

def guardar_sql_en_archivo(nombre_archivo: str, sentencias_sql: List[str]):
    """
    Escribe una lista de sentencias SQL en un archivo de texto.

    Args:
        nombre_archivo (str): La ruta y nombre del archivo de salida (ej: 'fechas.sql').
        sentencias_sql (List[str]): La lista de comandos SQL a escribir.
    """
    try:
        with open(nombre_archivo, 'w', encoding='utf-8') as f:
            for linea in sentencias_sql:
                f.write(linea + '\n')
        print(f"✅ Archivo '{nombre_archivo}' generado exitosamente con {len(sentencias_sql)} registros.")
    except IOError as e:
        print(f"❌ Error al escribir en el archivo '{nombre_archivo}': {e}")


if __name__ == "__main__":
    # --- CONFIGURACIÓN ---
    # Define el rango de años que quieres generar
    anio_inicio = 2025
    anio_fin = 2031
    archivo_salida = "insert_dim_dates.sql"
    # ---------------------

    print(f"Generando sentencias SQL para los años {anio_inicio} a {anio_fin}...")
    
    todas_las_sentencias = []
    for anio_actual in range(anio_inicio, anio_fin + 1):
        print(f"Procesando año: {anio_actual}...")
        sentencias_del_anio = generar_sql_para_anio(anio_actual)
        todas_las_sentencias.extend(sentencias_del_anio)
    
    if todas_las_sentencias:
        guardar_sql_en_archivo(archivo_salida, todas_las_sentencias)
    else:
        print("No se generaron sentencias SQL.")