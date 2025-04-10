import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateGroupTransactionDto } from './dto/create-groupTransaction.dto';
import { InviteUsersDto } from './dto/invite-users.dto';
import { UpdateGroupTransactionDto } from './dto/update-groupTransaction.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get('/user')
  async getGroups(@Request() req) {
    return this.groupService.getGroupsByUserId(req.user.sub);
  }

  @Get('/user/details/:groupId')
  async getUsersInfo(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupService.getUsersInfo(groupId, req.user.sub);
  }

  @Get('/getusers/:groupId')
  async getUserGroups(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupService.getUserGroups(groupId, req.user.sub);
  }

  @Get('/name/:groupId')
  async getGroupName(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupService.getGroupName(groupId, req.user.sub);
  }

  @Put('/pay/:groupId')
  async setUserPayGroup(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupService.setUserPayGroup(groupId, req.user.sub);
  }

  @Delete('leave/:groupId')
  async leaveGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Request() req,
  ) {
    return this.groupService.leaveGroup(groupId, req.user.sub);
  }

  @Delete('remove/:groupId/:userId')
  async removeUserGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    return this.groupService.removeUserGroup(groupId, userId, req.user.sub);
  }

  @Delete('delete/:groupId')
  async removeGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Request() req,
  ) {
    return this.groupService.removeGroup(groupId, req.user.sub);
  }

  @Put('setboss/:groupId/:userId')
  async setBossUserGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    return this.groupService.setBossUserGroup(groupId, userId, req.user.sub);
  }

  @Put('update/:groupId')
  async updateGroupName(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() CreateGroupDto: CreateGroupDto,
    @Request() req,
  ) {
    return this.groupService.updateGroupName(
      groupId,
      CreateGroupDto,
      req.user.sub,
    );
  }

  @Post('transaction')
  async createGroupTransaction(
    @Body() CreateGroupTransactionDto: CreateGroupTransactionDto,
    @Request() req,
  ) {
    CreateGroupTransactionDto.userId = req.user.sub;
    return this.groupService.createGroupTransaction(CreateGroupTransactionDto);
  }

  @Delete('transaction/:transactionId')
  async deleteGroupTransaction(
    @Request() req,
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ) {
    return this.groupService.deleteGroupTransaction(
      transactionId,
      req.user.sub,
    );
  }

  @Put('transaction/:transactionId')
  async updateGroupTransaction(
    @Body() UpdateGroupTransactionDto: UpdateGroupTransactionDto,
    @Request() req,
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ) {
    UpdateGroupTransactionDto.userId = req.user.sub;
    return this.groupService.updateGroupTransaction(
      UpdateGroupTransactionDto,
      transactionId,
    );
  }

  @Post('invite/:groupId')
  async inviteUsersToGroup(
    @Request() req,
    @Body() inviteUsersDto: InviteUsersDto,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupService.inviteUsersToGroup(
      req.user.sub,
      inviteUsersDto.users,
      groupId,
    );
  }

  @Post('join/:groupId/:notificationId')
  async joinGroup(
    @Request() req,
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupService.joinGroup(req.user.sub, groupId, notificationId);
  }

  @Post()
  async createGroup(@Body() CreateGroupDto: CreateGroupDto, @Request() req) {
    CreateGroupDto.userId = req.user.sub;
    CreateGroupDto.isBoss = true;
    return this.groupService.createGroup(CreateGroupDto);
  }
}
