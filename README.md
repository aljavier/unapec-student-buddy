# unapec-student-buddy
Way too soon, will edit info later.

### Obteniendo los pensumes con un crawler ###

El archivo `pensums.json` contiene todos las escuelas de [UNAPEC](http://unapec.edu.do/) con los pensumes
de cada carrera. Estos han sido obtenidos automáticamente con el crawler que he hecho en *Python* y también
se encuentra en este repositorio con nombre **pensums_crawler.py**. 

En caso que se quiera obtener los pensumes nuevamente sólo bastaría con ejecutar el script:

    python pensumes_crawler.py
    
El script hasta ahora ha sido testeado sólo en *Python* 2.x.x, pero debería funcionar bien en Python 3.

### Estatus actual: ###

~~Creado proyecto Ionic inicial. Trabajando en la app.~~

Trabajando en calculo de GPA.

### Iniciar servidor en cloud9 ###

ionic serve --host "$IP" --port "$PORT"