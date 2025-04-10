import {
  Body,
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  Post,
  UseGuards,
  Request,
  Query,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReadNotificationsDto } from './dto/read-notifications.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard) // Applicazione del guard
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  async getUserInfo(@Request() req) {
    return this.userService.getUserInfo(req.user.sub);
  }

  @Get('notifications')
  async getUserNotifications(@Request() req) {
    return this.userService.getUserNotifications(req.user.sub);
  }

  @Get()
  async getUserToInvite(
    @Request() req,
    @Query('searchQuery') searchQuery: string,
    @Query('groupID', ParseIntPipe) groupID: number,
  ) {
    return this.userService.getUserToInvite(req.user.sub, searchQuery, groupID);
  }

  @Get('notifications/unread')
  async countUnreadNotifications(@Request() req) {
    return this.userService.countUnreadNotifications(req.user.sub);
  }

  @Put('readnotifications')
  async readNotification(
    @Request() req,
    @Body() readNotificationsDto: ReadNotificationsDto,
  ) {
    return this.userService.readNotification(
      req.user.sub,
      readNotificationsDto,
    );
  }

  @Delete('decline/:notificationId')
  async declineNotification(
    @Request() req,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    return this.userService.declineNotification(req.user.sub, notificationId);
  }

  @Delete()
  async deleteUser(@Request() req) {
    return this.userService.deleteUser(req.user.sub);
  }

  @Put('details')
  async updateUserDetails(
    @Request() req,
    @Body() UpdateUserDto: UpdateUserDto,
  ) {
    UpdateUserDto.id = req.user.sub;
    return this.userService.updateUserDetails(UpdateUserDto);
  }

  @Put('password')
  async updateUserPassword(@Request() req, @Body('password') password: string) {
    return this.userService.updateUserPassword(req.user.sub, password);
  }
}
