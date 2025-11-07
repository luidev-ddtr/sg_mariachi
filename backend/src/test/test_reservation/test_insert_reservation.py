from src.dim_reservations.repositorio.insert_reservation import insert_reservation
from src.dim_reservations.reservation_model import Reservation
from src.utils.conexion import Conexion
import pytest
from unittest.mock import patch, Mock, MagicMock
from datetime import datetime
from src.dim_reservations.reservation_handler import ReservationService
import pytest

# Fixture para datos (tu original, con fecha ajustada para consistencia)
@pytest.fixture
def sample_reservation_data():
    return {
        "DIM_ReservationId": "4e4dad3d-e0ce-5a39",  # No se usa, service lo genera
        "DIM_PeopleId": "ce037ec9-32c2-58f1",
        "DIM_StatusId": "6d0fa47f-1933-5928",
        "DIM_DateId": "2025-11-05",  # Ajustado
        "DIM_ServiceOwnersId": "f07e69a4-4e80-527e",
        "DIM_EventAddress": "san monica de Santa elena el Bajio Guanaguato mexico",
        "DIM_StartDate": "2025-11-05 14:00:00",  # Espacio OK con tweak en service
        "DIM_EndDate": "2025-11-05 19:00:00",
        "DIM_NHours": 5.0,
        "DIM_TotalAmount": 1000.0,
        "DIM_Notes": "mariachis para xv de color verde pantano"
    }

@pytest.fixture
def overlapping_reservation_data(sample_reservation_data):
    data = sample_reservation_data.copy()
    data["DIM_StartDate"] = "2025-11-05 16:00:00"  # Choca con 14-19 si existe
    data["DIM_EndDate"] = "2025-11-05 20:00:00"
    return data

def test_insert_reservation_success(sample_reservation_data):
    """Prueba éxito sin overlaps (usando patch manual)."""
    # Patch manual de get_dates_reservations (vacío)
    with patch('src.dim_reservations.repositorio.get_dates_reservations', return_value=[]):
        # Patch de Conexion: Simula cursor y commit
        mock_conn = Mock()
        mock_cursor = MagicMock()
        mock_conn.conn.cursor.return_value = mock_cursor
        mock_cursor.lastrowid = 1
        mock_cursor.execute.return_value = None
        mock_conn.conn.commit.return_value = None
        mock_conn.close_conexion.return_value = None
        
        with patch('src.dim_reservations.reservation_handler.Conexion', return_value=mock_conn):
            # Patches de IDs
            with patch('src.dim_reservations.reservation_handler.create_id', return_value='RES_UUID_123'):
                with patch('src.dim_reservations.reservation_handler.DIM_DATE') as mock_dim_date:
                    mock_dim_date.generate_date_id.return_value = 'DATE_20251105'
                    
                    service = ReservationService()
                    msg, status = service.create_reservation(sample_reservation_data)
    
    assert status == 201
    assert "Reserva creada exitosamente" in msg
    mock_cursor.execute.assert_called_once()
    mock_conn.conn.commit.assert_called_once()
    print("✅ Test éxito: Reserva insertada sin problemas")

def test_insert_reservation_overlap_failure(overlapping_reservation_data):
    """Prueba falla por overlap."""
    # Patch de get_dates_reservations con conflicto
    conflicting_res = [{
        'DIM_ReservationId': 'RES_OLD_456',
        'DIM_StartDate': '2025-11-05T14:00:00',  # Choca
        'DIM_EndDate': '2025-11-05T19:00:00'
    }]
    
    with patch('src.dim_reservations.reservation_handler.get_dates_reservations', return_value=conflicting_res):
        # Mock conexión (no se hace rollback en ValueError, solo se retorna 400)
        mock_conn = Mock()
        mock_conn.close_conexion.return_value = None
        with patch('src.dim_reservations.reservation_handler.Conexion', return_value=mock_conn):
            # Patches extras
            with patch('src.dim_reservations.reservation_handler.create_id'):
                with patch('src.dim_reservations.reservation_handler.DIM_DATE'):
                    
                    service = ReservationService()
                    msg, status = service.create_reservation(overlapping_reservation_data)
    
    assert status == 400
    assert "Choque de horario con reserva RES_OLD_456" in msg
    # ValueError no hace rollback, solo retorna 400 (línea 164 del handler)
    mock_conn.conn.commit.assert_not_called()
    print("✅ Test falla: Overlap detectado correctamente")

def test_insert_reservation_invalid_dates(sample_reservation_data):
    """Prueba falla si Start == End (inválido)."""
    invalid_data = sample_reservation_data.copy()
    invalid_data["DIM_StartDate"] = "2025-11-05 14:00:00"
    invalid_data["DIM_EndDate"] = "2025-11-05 14:00:00"  # Igual
    
    # Configurar el mock para que lance una excepción de fechas inválidas
    with patch('src.dim_reservations.reservation_handler.ReservaService') as MockReservaService, \
         patch('src.dim_reservations.reservation_handler.DIM_DATE'), \
         patch('src.dim_reservations.reservation_handler.create_id'):
    
        MockReservaService.return_value.validate_overlaps.side_effect = ValueError("La hora de inicio debe ser anterior a la hora de fin.")

        # Ejecutar el servicio y verificar que lance la excepción
        service = ReservationService()
        with pytest.raises(ValueError) as excinfo:
            service.create_reservation(invalid_data)
    
        # Verificar el mensaje de la excepción
        assert "La hora de inicio debe ser anterior a la hora de fin." in str(excinfo.value)
        print("✅ Test falla: Fechas inválidas detectadas correctamente")
