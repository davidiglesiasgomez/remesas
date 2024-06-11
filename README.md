# Remesas

Es un intento de SPA o PWA en HTML, CSS y vanilla JS para generar ficheros XML de remesas bancarias SEPA.

Por ahora solo está pensada para usar el local storage del navegador, pero se podría crear algún tipo de worker para sincronizar datos contra un webservice.

Para darle un poco de estilo se ha usado [PureCSS](https://purecss.io/), aunque quizá no sea la elección final.

El fichero para importar los datos de los clientes es un CSV sacado de una aplicación bancaria con el siguiente formato:

```csv
nombre;iban;dato desconocido 1;domicilio;código postal y localidad;provincia;código de país;dato desconocido2;nif;fecha de inserción
```
