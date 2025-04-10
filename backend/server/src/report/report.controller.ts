import {
  Controller,
  Get,
  Param,
  Res,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('/:accountId/:type/:timeline')
  async getReport(
    @Request() req,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('type') type: string,
    @Param('timeline') timeline: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportService.getReport(
      req.user.sub,
      type,
      timeline,
      accountId,
    );

    if (type === 'pdf') {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=report_${timeline}.pdf`,
      });
    } else if (type === 'excel') {
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=report_${timeline}.xlsx`,
      });
    }

    res.send(buffer);
  }
}
