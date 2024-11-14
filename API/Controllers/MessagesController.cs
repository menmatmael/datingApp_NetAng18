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
    IMessageRepository messageRepository,
    IUserRepository userRepository,
    IMapper mapper) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        string username = User.GetUsername();

        if (username == createMessageDto.RecipientUsername) return BadRequest("You cannot message yourself");

        AppUser? sender = await userRepository.GetUserByUsernameAsync(username);
        AppUser? recipient = await userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

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

        messageRepository.AddMessage(message);

        if (await messageRepository.SaveAllAsync()) return Ok(mapper.Map<MessageDto>(message));

        return BadRequest("Failed to save the message");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
    {
        messageParams.Username = User.GetUsername();

        PagedList<MessageDto> messages = await messageRepository.GetMessagesForUser(messageParams);

        Response.AddPaginationHeader(messages);

        return messages;
    }

    [HttpGet("thread/{recipientUsername}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesThread(string recipientUsername)
    {
        string currentUsername = User.GetUsername();

        return Ok(await messageRepository.GetMessageThread(currentUsername, recipientUsername));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(int id)
    {
        string currentUsername = User.GetUsername();

        Message? message = await messageRepository.GetMessage(id);

        if (message == null) return BadRequest("cannot delete this message");

        if (
            message.SenderUsername != currentUsername &&
            message.RecipientUsername != currentUsername
        ) return Forbid();

        if (message.SenderUsername == currentUsername) message.SenderDeleted = true;

        if (message.RecipientUsername == currentUsername) message.RecipientDeleted = true;

        if (message is {SenderDeleted: true, RecipientDeleted: true}) {
            messageRepository.DeleteMessage(message);
        }

        if (await messageRepository.SaveAllAsync()) return Ok();

        return BadRequest("Problem deleting the message");
    }
}
