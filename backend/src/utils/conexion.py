import mysql.connector
from mysql.connector import Error


class Conexion:
    """
    Clase para gestionar la conexión a la base de datos MySQL
    """

    def __init__(self) -> None:
        """
        Inicializa la conexión con la base de datos MySQL
        """
        self.conn = None
        self.cursor = None
        try:
            self.conn = mysql.connector.connect(
                host="localhost",
                user="root",
                password="",  # Agrega la contraseña si es necesaria
                database="bd_mariachi",
                charset='utf8mb4',  # Mejor soporte para caracteres especiales
                collation='utf8mb4_unicode_ci'
            )
            self.cursor = self.conn.cursor(dictionary=True)  # Devuelve resultados como diccionarios
            print("✅ Conexión a MySQL establecida correctamente")
            
        except Error as e:
            print(f"❌ Error al conectar con la base de datos MySQL: {e}")
            raise

    def save_changes(self) -> None:
        """
        Método que guarda los cambios en la base de datos
        """
        try:
            if self.conn and self.conn.is_connected():
                self.conn.commit()
                print("✅ Cambios guardados correctamente")
            else:
                print("⚠️ No hay conexión activa para guardar cambios")
        except Error as e:
            print(f"❌ Error al guardar los cambios: {e}")
            # Hacemos rollback en caso de error
            if self.conn:
                self.conn.rollback()
            raise

    def conexion(self) -> tuple:
        """
        Devuelve una tupla con la conexión y el cursor
        """
        if self.conn is None or self.cursor is None:
            raise Exception("La conexión no está inicializada")
        
        if not self.conn.is_connected():
            self._reconectar()
            
        return self.conn, self.cursor

    def _reconectar(self) -> None:
        """
        Método privado para reconectar si la conexión se perdió
        """
        try:
            self.close_conexion()
            self.__init__()
        except Error as e:
            print(f"❌ Error al reconectar: {e}")
            raise

    def close_conexion(self) -> None:
        """
        Cierra la conexión y el cursor de manera segura
        """
        try:
            if self.cursor:
                self.cursor.close()
                self.cursor = None
            if self.conn and self.conn.is_connected():
                self.conn.close()
                self.conn = None
            print("🔌 Conexión cerrada correctamente")
        except Error as e:
            print(f"❌ Error al cerrar la conexión: {e}")
            raise

    # Context manager support (para usar con 'with')
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close_conexion()


if __name__ == "__main__":
    """
    Prueba de conexión a la base de datos MySQL
    """
    print("🔍 Intentando conexión a MySQL...")
    
    try:
        with Conexion() as conexion:
            conn, cursor = conexion.conexion()
            
            # Verificar si la tabla existe
            cursor.execute("SHOW TABLES LIKE 'DIM_Status'")
            tabla_existe = cursor.fetchone()
            
            if tabla_existe:
                # Ejecutar consulta de prueba
                datos = conexion.execute_query("SELECT * FROM DIM_Status LIMIT 5")
                print("📊 Datos de DIM_Status:")
                for fila in datos:
                    print(f"  - {fila}")
            else:
                print("⚠️ La tabla DIM_Status no existe en la base de datos")
                
            # Mostrar información de la conexión
            print(f"📡 Información del servidor: {conn.get_server_info()}")
            print(f"🔢 Versión del conector: {mysql.connector.__version__}")
            
    except Exception as e:
        print(f"❌ Error durante la prueba: {e}")
    
    print("🏁 Prueba de conexión finalizada")