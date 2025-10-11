insert into evento (fecha, hora, lugar, idiomas_permitidos, edad_minima, max_personas, titulo, descripcion)
values
  (dateadd('DAY', 7, current_date),  time '18:00:00', 'Madrid, Plaza Mayor', 'es,en', 18, 50, 'Paseo gastronómico', 'Ruta de tapas por el centro.'),
  (dateadd('DAY',14, current_date),  time '10:30:00', 'Barcelona, Sagrada Familia', 'es,en,fr', null, 25, 'Tour cultural', 'Visita exterior y paseo por Eixample.');
