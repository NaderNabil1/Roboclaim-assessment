<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Models\User;
use Illuminate\Http\Request;

class AdminSupportConversationController extends Controller
{
    public function index()
    {
        $conversations = SupportConversation::query()
            ->with([
                'user:id,first_name,last_name,email',
                'latestMessage.sender:id,first_name,last_name,email,role',
            ])
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'conversations' => $conversations->map(fn (SupportConversation $c) => $this->serializeAdminSummary($c)),
        ]);
    }

    public function messages(SupportConversation $supportConversation)
    {
        $supportConversation->load('user:id,first_name,last_name,email');

        $messages = SupportMessage::query()
            ->where('support_conversation_id', $supportConversation->id)
            ->with('sender:id,first_name,last_name,email,role')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'conversation' => [
                'id' => (string) $supportConversation->id,
                'subject' => $supportConversation->subject,
                'updatedAt' => $supportConversation->updated_at->toIso8601String(),
                'user' => [
                    'id' => (string) $supportConversation->user->id,
                    'firstName' => $supportConversation->user->first_name,
                    'lastName' => $supportConversation->user->last_name,
                    'email' => $supportConversation->user->email,
                ],
            ],
            'messages' => $messages->map(fn (SupportMessage $m) => $this->serializeMessage($m)),
        ]);
    }

    public function sendMessage(Request $request, SupportConversation $supportConversation)
    {
        $data = $request->validate([
            'message' => 'required|string|max:10000',
        ]);

        /** @var User $admin */
        $admin = auth('api')->user();
        if (! $admin->isAdmin()) {
            abort(403);
        }

        $message = SupportMessage::create([
            'support_conversation_id' => $supportConversation->id,
            'sender_id' => $admin->id,
            'body' => $data['message'],
        ]);
        $supportConversation->touch();
        $message->load('sender:id,first_name,last_name,email,role');

        return response()->json([
            'message' => $this->serializeMessage($message),
        ], 201);
    }

    private function serializeAdminSummary(SupportConversation $c): array
    {
        $c->loadMissing(['user:id,first_name,last_name,email', 'latestMessage.sender:id,first_name,last_name,email,role']);

        return [
            'id' => (string) $c->id,
            'subject' => $c->subject,
            'updatedAt' => $c->updated_at->toIso8601String(),
            'user' => [
                'id' => (string) $c->user->id,
                'firstName' => $c->user->first_name,
                'lastName' => $c->user->last_name,
                'email' => $c->user->email,
            ],
            'lastMessage' => $c->latestMessage
                ? [
                    'preview' => mb_strlen($c->latestMessage->body) > 120
                        ? mb_substr($c->latestMessage->body, 0, 117).'...'
                        : $c->latestMessage->body,
                    'createdAt' => $c->latestMessage->created_at->toIso8601String(),
                    'fromRole' => $c->latestMessage->sender->role,
                ]
                : null,
        ];
    }

    private function serializeMessage(SupportMessage $m): array
    {
        $m->loadMissing('sender:id,first_name,last_name,email,role');

        return [
            'id' => (string) $m->id,
            'body' => $m->body,
            'createdAt' => $m->created_at->toIso8601String(),
            'sender' => [
                'id' => (string) $m->sender->id,
                'firstName' => $m->sender->first_name,
                'lastName' => $m->sender->last_name,
                'email' => $m->sender->email,
                'role' => $m->sender->role,
            ],
        ];
    }
}
