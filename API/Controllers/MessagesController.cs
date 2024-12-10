using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class MessagesController(
    IUnitOfWork unitOfWork,
    IMapper mapper) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        string username = User.GetUsername();

        if (username == createMessageDto.RecipientUsername) return BadRequest("You cannot message yourself");

        AppUser? sender = await unitOfWork.UserRepository.GetUserByUsernameAsync(username);
        AppUser? recipient = await unitOfWork.UserRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

        if (recipient == null || sender == null || sender.UserName == null || recipient.UserName == null)
            return BadRequest("cannot send message as recipent or sender can't be retrieved.");

        Message message = new Message
        {
            Sender = sender,
            SenderUsername = sender.UserName,
            Recipient = recipient,
            RecipientUsername = recipient.UserName,
            Content = createMessageDto.Content
        };

        unitOfWork.MessageRepository.AddMessage(message);

        if (await unitOfWork.Complete()) return Ok(mapper.Map<MessageDto>(message));

        return BadRequest("Failed to save the message");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
    {
        messageParams.Username = User.GetUsername();

        PagedList<MessageDto> messages = await unitOfWork.MessageRepository.GetMessagesForUser(messageParams);

        Response.AddPaginationHeader(messages);

        return messages;
    }

    [HttpGet("thread/{recipientUsername}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesThread(string recipientUsername)
    {
        string currentUsername = User.GetUsername();

        return Ok(await unitOfWork.MessageRepository.GetMessageThread(currentUsername, recipientUsername));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(int id)
    {
        string currentUsername = User.GetUsername();

        Message? message = await unitOfWork.MessageRepository.GetMessage(id);

        if (message == null) return BadRequest("cannot delete this message");

        if (
            message.SenderUsername != currentUsername &&
            message.RecipientUsername != currentUsername
        ) return Forbid();

        if (message.SenderUsername == currentUsername) message.SenderDeleted = true;

        if (message.RecipientUsername == currentUsername) message.RecipientDeleted = true;

        if (message is {SenderDeleted: true, RecipientDeleted: true}) {
            unitOfWork.MessageRepository.DeleteMessage(message);
        }

        if (await unitOfWork.Complete()) return Ok();

        return BadRequest("Problem deleting the message");
    }
}
