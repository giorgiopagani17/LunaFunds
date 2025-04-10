import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getReport(
    userId: number,
    type: string,
    timeline: string,
    accountId: number,
  ) {
    try {
      if (type === 'excel') {
        return await this.getExcelReport(userId, timeline, accountId);
      } else {
        return await this.getPDFReport(userId, timeline, accountId);
      }
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  private formatTimeline(timeline: string) {
    if (/^[a-zA-Z]+[0-9]{4}$/.test(timeline)) {
      const monthStr = timeline.slice(0, -4); // Ottieni il nome del mese
      const year = timeline.slice(-4); // Ottieni l'anno
      const month = new Date(`${monthStr} 1, 2020`).getMonth(); // Ottieni l'indice del mese (1-based)
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      return `${months[month]} ${year}`;
    } else if (/^[0-9]{4}$/.test(timeline)) {
      return timeline; // Se solo l'anno, ritorna l'anno
    } else {
      throw new BadRequestException('Invalid timeline format');
    }
  }

  async getExcelReport(userId: number, timeline: string, accountId: number) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');

      // Formatta la timeline come desiderato (ad esempio "November 2024")
      const formattedTimeline = this.formatTimeline(timeline);

      // Definisci gli header per la riga 3 (subito sotto il titolo)
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Category', key: 'categoryName', width: 20 },
        { header: 'Amount', key: 'amount', width: 20 },
        { header: 'Date', key: 'createdAt', width: 20 },
        { header: 'Account', key: 'accountName', width: 20 },
      ];

      // Aggiungi gli header alla riga 3 e metti il testo in grassetto
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };

      let startDate: Date;
      let endDate: Date;

      if (/^[a-zA-Z]+[0-9]{4}$/.test(timeline)) {
        const month = timeline.slice(0, -4);
        const year = timeline.slice(-4);
        startDate = new Date(
          `${year}-${new Date(Date.parse(month + ' 1, 2024')).getMonth() + 1}-01`,
        );
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (/^[0-9]{4}$/.test(timeline)) {
        startDate = new Date(`${timeline}-01-01`);
        endDate = new Date(`${timeline}-12-31`);
      } else {
        throw new BadRequestException('Invalid timeline format');
      }

      // Recupera i dati dal database
      const data = await this.prisma.transactions.findMany({
        where: {
          userId,
          accountId,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: {
          name: true,
          amount: true,
          createdAt: true,
          categories: { select: { name: true } },
          accounts: { select: { name: true } },
        },
      });

      const user = await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
        select: {
          currency: true,
        },
      });

      let totalAmount = 0;

      // Aggiungi i dati sotto gli header
      data.forEach((item) => {
        const amountWithCurrency = `${item.amount.toFixed(2)} ${user.currency}`;
        worksheet.addRow({
          name: item.name,
          amount: amountWithCurrency,
          accountName: item.accounts?.name || 'N/A',
          categoryName: item.categories?.name || 'N/A',
          createdAt: new Date(item.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        });
        totalAmount += item.amount;
      });

      // Aggiungi una riga vuota prima del totale
      worksheet.addRow([]);

      // Aggiungi la riga del totale
      const totalRow = worksheet.addRow([]);
      worksheet.mergeCells(`A${totalRow.number}:D${totalRow.number}`);
      totalRow.getCell('A').value =
        `LF - Report for ${formattedTimeline} - Total Amount:`;
      totalRow.getCell('A').font = { bold: true };
      totalRow.getCell('E').value =
        `${totalAmount.toFixed(2)} ${user.currency}`;
      totalRow.getCell('E').font = { bold: true };

      // Restituisci il buffer per il download
      return workbook.xlsx.writeBuffer();
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  async getPDFReport(userId: number, timeline: string, accountId: number) {
    try {
      const formattedTimeline = this.formatTimeline(timeline); // Formatta la timeline
      const doc = new PDFDocument({ margin: 30 });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => console.log('PDF generation completed.'));

      // Intestazione del PDF
      doc
        .fontSize(20)
        .text(`LF - Report for ${formattedTimeline}`, { align: 'center' });
      doc.moveDown(0.5);

      let startDate: Date;
      let endDate: Date;

      if (/^[a-zA-Z]+[0-9]{4}$/.test(timeline)) {
        const month = timeline.slice(0, -4);
        const year = timeline.slice(-4);
        startDate = new Date(
          `${year}-${new Date(Date.parse(month + ' 1, 2024')).getMonth() + 1}-01`,
        );
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (/^[0-9]{4}$/.test(timeline)) {
        startDate = new Date(`${timeline}-01-01`);
        endDate = new Date(`${timeline}-12-31`);
      } else {
        throw new BadRequestException('Invalid timeline format');
      }

      // Recupera i dati
      const transactions = await this.prisma.transactions.findMany({
        where: {
          userId,
          accountId,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: {
          name: true,
          amount: true,
          createdAt: true,
          categories: { select: { name: true } },
          accounts: { select: { name: true } },
        },
      });

      const user = await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
        select: {
          currency: true,
        },
      });

      let totalAmount = 0;
      transactions.forEach((transaction) => {
        totalAmount += transaction.amount;
      });

      doc
        .fontSize(16)
        .text(`Total Amount: ${totalAmount.toFixed(2)}${user.currency}`, {
          align: 'center',
        });

      doc.moveDown(1.5);

      const tableTop = doc.y;
      const itemHeight = 20; // Altezza di ogni riga

      const columnPositions = {
        name: 30,
        category: 200,
        amount: 300,
        date: 400,
        account: 500,
      };

      // Intestazioni della tabella
      doc
        .fontSize(12)
        .text('Name', columnPositions.name, tableTop, { bold: true })
        .text('Amount', columnPositions.amount, tableTop, { bold: true })
        .text('Date', columnPositions.date, tableTop, { bold: true })
        .text('Category', columnPositions.category, tableTop, { bold: true })
        .text('Account', columnPositions.account, tableTop, { bold: true });
      doc.moveDown();

      // Dati della tabella
      let y = tableTop + itemHeight;

      transactions.forEach((transaction) => {
        const dateFormatted = new Date(
          transaction.createdAt,
        ).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

        doc
          .fontSize(10)
          .text(transaction.name, columnPositions.name, y)
          .text(
            (transaction.amount.toFixed(2) + user.currency).toString(),
            columnPositions.amount,
            y,
          )
          .text(dateFormatted, columnPositions.date, y)
          .text(
            transaction.categories?.name || 'N/A',
            columnPositions.category,
            y,
          )
          .text(
            transaction.accounts?.name || 'N/A',
            columnPositions.account,
            y,
          );

        y += itemHeight;

        if (y > doc.page.height - 50) {
          doc.addPage();
          y = 30;
        }
      });

      doc.end();

      return Buffer.concat(chunks);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
