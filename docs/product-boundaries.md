# Hybrid OS - Limites por seccion

Fecha: 2026-06-17

Este documento define que responsabilidad tiene cada seccion de Hybrid OS y que debe evitar para no duplicar otras pantallas.

## Home

Responsabilidad:

- centro diario rapido;
- Daily Plan manual;
- snapshot objetivo;
- ultimo entrenamiento;
- acceso directo a importar;
- senales breves para preparar el check diario.

Limites:

- no debe ser un Dashboard largo;
- no debe mostrar informes profundos;
- no debe competir con Analysis;
- no debe decidir que hacer hoy.

## Dashboard

Responsabilidad:

- panel de estado del periodo;
- datos claros del rango seleccionado;
- contexto para decision;
- KPIs principales;
- riesgos y evidencias cortas;
- preview de profundidad con salida hacia Analysis.

Limites:

- no debe dar ordenes;
- no debe duplicar Analysis;
- no debe acumular todos los informes;
- no debe convertirse en una pantalla de laboratorio.

## Analysis

Responsabilidad:

- laboratorio profundo;
- tendencias completas;
- informes semanales y mensuales;
- calidad de datos;
- evidencias amplias;
- contexto copiable para check diario.

Limites:

- no debe competir con Home;
- no debe ser la entrada diaria principal;
- no debe prescribir acciones como entrenador;
- no debe persistir informes ni tocar Supabase.

## Goals

Responsabilidad:

- seguimiento del objetivo activo;
- progreso;
- lo que suma;
- lo que resta;
- datos insuficientes;
- contexto para check diario.

Limites:

- no debe ser una agenda;
- no debe mezclar objetivo, plan y ejecucion como si fueran la misma capa;
- no debe ocultar incertidumbre cuando faltan datos;
- la planificacion beta debe quedar abajo y con menor protagonismo.

## Planning

Responsabilidad:

- capa opcional;
- comparar intencion semanal con ejecucion real;
- mostrar desviaciones simples entre `planned_sessions`, `training_sessions` y `daily_entries`;
- aportar contexto al check diario.

Limites:

- no debe ser obligatorio;
- no debe dominar Goals;
- no debe crear sesiones reales;
- no debe sustituir Daily Plan;
- no debe convertirse en calendario complejo todavia.

## Training Log

Responsabilidad:

- fuente de verdad operativa;
- busqueda;
- revision;
- detalle;
- acceso rapido al historial real.

Limites:

- no debe depender del seed cuando Supabase devuelve datos reales;
- no debe ocultar sesiones pendientes de sincronizacion;
- no debe perder velocidad ni claridad por analisis secundarios.

## Importador

Responsabilidad:

- entrada principal de datos;
- cero friccion;
- validacion clara;
- preview antes de guardar;
- warnings y errores comprensibles;
- deteccion prudente de duplicados;
- preservacion de raw data.

Limites:

- nunca debe perder `raw_imports`;
- nunca debe reducir el `payload` a campos simples;
- no debe reemplazar ids reales si representan la misma sesion;
- no debe mezclar imports de entrenamiento con programaciones avanzadas en esta fase.

## Running

Responsabilidad:

- solo carrera;
- running estructurado frente a carrera mixta;
- volumen;
- ritmo cuando exista distancia y duracion;
- zapatillas cuando existan;
- contexto especifico de exposicion de carrera.

Limites:

- no debe explicar toda la carga global;
- no debe mezclar lectura muscular salvo que afecte directamente a carrera;
- no debe tratar carrera mixta como running tecnico;
- no debe duplicar Analysis.

## Muscle Load

Responsabilidad:

- solo carga muscular;
- rankings;
- ratios;
- sesiones clave;
- sesgos y grupos dominantes;
- lectura especifica de carga local.

Limites:

- no debe mostrar calidad de datos general;
- no debe convertirse en Dashboard;
- no debe implementar BodyMap improvisado;
- BodyMap futuro debe ser asset-based.

