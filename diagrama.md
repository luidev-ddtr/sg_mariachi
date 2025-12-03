```mermaid
graph TD
    %% =========================================
    %% 1. VISIÓN GENERAL DE LA ARQUITECTURA
    %% =========================================
    subgraph "Parte 1: Visión General (Arquitectura Cliente-Servidor) [cite: 2, 3]"
        direction LR
        FRONTEND_APP[("Aplicación Frontend (Cliente)\nWeb App Consumidora\n[cite: 5]")]
        BACKEND_APP[("Aplicación Backend (Servidor)\nAPI RESTful\nLógica de Negocio y Datos\n[cite: 4]")]
        
        FRONTEND_APP <==>|Comunicación exclusiva vía API REST\n(HTTP/JSON)\n[cite: 5]| BACKEND_APP
    end

    %% =========================================
    %% 2. ARQUITECTURA DEL BACKEND
    %% =========================================
    subgraph "Parte 2: Detalle del Backend (Monolito Modular) [cite: 7, 9, 11]"
        direction TB
        
        subgraph "Tech Stack Backend [cite: 32]"
            PYTHON[Python] --- FLASK[Flask Framework]
            FLASK --- JWT[Flask-JWT-Extended\n(Seguridad)\n[cite: 35]]
            FLASK --- GUNICORN[Gunicorn\n(Servidor WSGI)\n[cite: 35]]
        end

        subgraph "Estructura Interna del Monolito "
            ROUTING["Ruteo Centralizado (Endpoints)\n(Raíz del proyecto)\n"]
            
            subgraph "Módulos de Dominio (Alta Cohesión) "
                
                subgraph "Ejemplo: Dominio 'Usuarios' (Patrón N-Tier) [cite: 17]"
                    CONTROLLER["Capa de Manejador (Controller)\nValida entrada, formatea respuesta HTTP\n"]
                    SERVICE["Capa de Servicios (BLL)\nLógica de negocio, orquestación\n"]
                    REPO["Capa de Repositorio (DAL)\nAcceso a datos, SQL Nativo\n(Sin ORM)\n[cite: 21, 23, 42, 44]"]
                    MODEL["Modelo de Datos\nEstructuras y entidades\n"]
                    
                    ROUTING --> CONTROLLER
                    CONTROLLER --> SERVICE
                    SERVICE --> REPO
                    REPO -.-> MODEL
                end
                
                subgraph "Otros Dominios (ej. Pedidos, Inventario)"
                    OTHER_DOMAIN[Módulo Dominio B]
                    ROUTING --> OTHER_DOMAIN
                end
                 %% Bajo acoplamiento entre dominios vía servicios 
                 SERVICE -.->|Comunicación entre dominios\n(API Interna)\n| OTHER_DOMAIN
            end
        end

        subgraph "Capa de Datos [cite: 36]"
            MYSQL[("Base de Datos MySQL\n(Entorno XAMPP)\n[cite: 39, 40]")]
            DB_VIEWS["Vistas de BD (Views)\nLógica compleja delegada a la BD\n[cite: 46, 47]"]
            
            REPO <==>|SQL Nativo\n[cite: 44]| MYSQL
            MYSQL --- DB_VIEWS
        end
    end

    %% =========================================
    %% 3. ARQUITECTURA DEL FRONTEND
    %% =========================================
    subgraph "Parte 3: Detalle del Frontend (Modular basado en Vistas) [cite: 49, 57]"
        direction TB
        
        subgraph "Entorno de Desarrollo y Build [cite: 53, 65]"
            VITE[Vite\n(Build rápido, ES Modules)\n[cite: 54]]
        end

        subgraph "Estructura Modular de Vistas Autocontenidas [cite: 57, 58]"
            
            subgraph "Vista: Clientes (clients.html)"
                HTML_C[HTML5 Structure]
                CSS_C[CSS3 Styles]
                JS_C[JavaScript (ES6+) Logic\nCommunication with API\n[cite: 61, 66]]
            end

            subgraph "Vista: Inventario (inventory.html)"
                HTML_I[HTML5]
                CSS_I[CSS3]
                JS_I[JavaScript (ES6+)\n]
            end
        end
        VITE -- Empaqueta --> HTML_C
        VITE -- Empaqueta --> HTML_I
    end

    %% Conexión Final Frontend -> Backend General
    JS_C -...->|Solicitudes HTTP/REST| ROUTING
    JS_I -...->|Solicitudes HTTP/REST| ROUTING

    style FRONTEND_APP fill:#e1f5fe,stroke:#01579b
    style BACKEND_APP fill:#ffe0b2,stroke:#e65100
    style VITE fill:#c8e6c9,stroke:#2e7d32
    style MYSQL fill:#cfd8dc,stroke:#455a64
    style REPO stroke:#d84315,stroke-width:2px,color:#d84315
    style DB_VIEWS stroke:#d84315,stroke-width:2px
    ```
