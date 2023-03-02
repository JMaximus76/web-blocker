
import type { PromiseError } from '../modules/types';





export function handelError(error: PromiseError) {
    console.error(error.message);
    if (error.details) console.table(error.details);
}









