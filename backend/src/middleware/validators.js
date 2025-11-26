export const validateCrearIncidencia = (req, res, next) => {
    const { titulo, descripcion, area_id, tipo_incidencia_id, prioridad_id } = req.body;
    const errors = [];

    // Validar campos requeridos
    if (!titulo) errors.push('El título es obligatorio');
    if (!descripcion) errors.push('La descripción es obligatoria');
    if (!area_id) errors.push('El área es obligatoria');
    if (!tipo_incidencia_id) errors.push('El tipo de incidencia es obligatorio');
    if (!prioridad_id) errors.push('La prioridad es obligatoria');

    // Validar longitud y formato
    if (titulo && (titulo.length < 5 || titulo.length > 100)) {
        errors.push('El título debe tener entre 5 y 100 caracteres');
    }

    if (descripcion && descripcion.length < 20) {
        errors.push('La descripción debe tener al menos 20 caracteres para asegurar suficiente detalle');
    }

    // Validar que los IDs sean números válidos
    if (area_id && isNaN(parseInt(area_id))) errors.push('El ID de área debe ser un número válido');
    if (tipo_incidencia_id && isNaN(parseInt(tipo_incidencia_id))) errors.push('El ID de tipo debe ser un número válido');
    if (prioridad_id && isNaN(parseInt(prioridad_id))) errors.push('El ID de prioridad debe ser un número válido');

    if (errors.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Error de validación',
            errors: errors
        });
    }

    next();
};

export const validateActualizarIncidencia = (req, res, next) => {
    const { titulo, descripcion, area_id, tipo_incidencia_id, prioridad_id } = req.body;
    const errors = [];

    // Si se envían, validar formato
    if (titulo !== undefined && (titulo.length < 5 || titulo.length > 100)) {
        errors.push('El título debe tener entre 5 y 100 caracteres');
    }

    if (descripcion !== undefined && descripcion.length < 20) {
        errors.push('La descripción debe tener al menos 20 caracteres');
    }

    if (area_id !== undefined && isNaN(parseInt(area_id))) errors.push('El ID de área debe ser un número válido');
    if (tipo_incidencia_id !== undefined && isNaN(parseInt(tipo_incidencia_id))) errors.push('El ID de tipo debe ser un número válido');
    if (prioridad_id !== undefined && isNaN(parseInt(prioridad_id))) errors.push('El ID de prioridad debe ser un número válido');

    if (errors.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Error de validación',
            errors: errors
        });
    }

    next();
};
