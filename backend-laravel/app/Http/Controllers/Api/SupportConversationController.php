<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupportConversationController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth('api')->id();

        $conversations = SupportConversation::query()
            ->where('user_id', $userId)
            ->with(['latestMessage.sender:id,first_name,last_name,email,role'])
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'conversations' => $conversations->map(fn (SupportConversation $c) => $this->serializeConversationSummary($c)),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:10000',
        ]);

        $userId = auth('api')->id();

        $conversation = DB::transaction(function () use ($data, $userId) {
            $c = SupportConversation::create([
                'user_id' => $userId,
                'subject' => $data['subject'],
            ]);
            SupportMessage::create([
                'support_conversation_id' => $c->id,
                'sender_id' => $userId,
                'body' => $data['message'],
            ]);

            return $c->load(['latestMessage.sender:id,first_name,last_name,email,role']);
        });

        return response()->json([
            'conversation' => $this->serializeConversationSummary($conversation),
        ], 201);
    }

    public function messages(Request $request, SupportConversation $supportConversation)
    {
        $this->authorizeConversation($supportConversation);

        $messages = SupportMessage::query()
            ->where('support_conversation_id', $supportConversation->id)
            ->with('sender:id,first_name,last_name,email,role')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'conversation' => $this->serializeConversationDetail($supportConversation),
            'messages' => $messages->map(fn (SupportMessage $m) => $this->serializeMessage($m)),
        ]);
    }

    public function sendMessage(Request $request, SupportConversation $supportConversation)
    {
        $this->authorizeConversation($supportConversation);

        $data = $request->validate([
            'message' => 'required|string|max:10000',
        ]);

        $userId = auth('api')->id();
        $message = SupportMessage::create([
            'support_conversation_id' => $supportConversation->id,
            'sender_id' => $userId,
            'body' => $data['message'],
        ]);
        $supportConversation->touch();
        $message->load('sender:id,first_name,last_name,email,role');

        return response()->json([
            'message' => $this->serializeMessage($message),
        ], 201);
    }

    private function authorizeConversation(SupportConversation $supportConversation): void
    {
        if ($supportConversation->user_id !== auth('api')->id()) {
            abort(403, 'You cannot access this conversation.');
        }
    }

    private function serializeConversationSummary(SupportConversation $c): array
    {
        $c->loadMissing('latestMessage.sender:id,first_name,last_name,email,role');

        return [
            'id' => (string) $c->id,
            'subject' => $c->subject,
            'updatedAt' => $c->updated_at->toIso8601String(),
            'lastMessage' => $c->latestMessage
                ? $this->serializeMessagePreview($c->latestMessage)
                : null,
        ];
    }

    private function serializeConversationDetail(SupportConversation $c): array
    {
        return [
            'id' => (string) $c->id,
            'subject' => $c->subject,
            'updatedAt' => $c->updated_at->toIso8601String(),
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

    private function serializeMessagePreview(SupportMessage $m): array
    {
        $m->loadMissing('sender:id,first_name,last_name,email,role');
        $preview = mb_strlen($m->body) > 120 ? mb_substr($m->body, 0, 117).'...' : $m->body;

        return [
            'preview' => $preview,
            'createdAt' => $m->created_at->toIso8601String(),
            'fromRole' => $m->sender->role,
        ];
    }
}
