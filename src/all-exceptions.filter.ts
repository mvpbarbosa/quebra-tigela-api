import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Exceções HTTP normais
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      return response.status(status).json({
        statusCode: status,
        message: (res as any).message || exception.message,
        error: (res as any).error || exception.name,
      });
    }

    // Erro de duplicate key do Mongo
    if (exception.code === 11000) {
      const campo = Object.keys(exception.keyPattern)[0];
      const valor = exception.keyValue[campo];

      const conflict = new ConflictException(
        `O campo '${campo}' com valor '${valor}' já está em uso.`,
      );

      return response.status(conflict.getStatus()).json({
        statusCode: conflict.getStatus(),
        message: conflict.message,
        error: 'Conflict',
      });
    }

    // Qualquer outro erro inesperado
    const internal = new InternalServerErrorException(
      'Erro interno do servidor',
    );
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: internal.getStatus(),
      message: (exception as any).message || internal.message,
      error: 'Internal Server Error',
    });
  }
}
