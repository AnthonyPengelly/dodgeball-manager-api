/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TransferController } from './../controllers/transfer.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TrainingController } from './../controllers/training.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SeasonController } from './../controllers/season.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ScoutingController } from './../controllers/scouting.controller.ts';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PlayerController } from './../controllers/player.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MatchController } from './../controllers/match.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LeagueController } from './../controllers/league.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GameController } from './../controllers/game.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FacilitiesController } from './../controllers/facilities.controller';
import { expressAuthentication } from './../middleware/auth.middleware';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "PlayerStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["draft"]},{"dataType":"enum","enums":["team"]},{"dataType":"enum","enums":["opponent"]},{"dataType":"enum","enums":["scout"]},{"dataType":"enum","enums":["transfer"]},{"dataType":"enum","enums":["sold"]},{"dataType":"enum","enums":["rejected"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TransferListedPlayer": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "game_id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "status": {"ref":"PlayerStatus","required":true},
            "throwing": {"dataType":"double","required":true},
            "catching": {"dataType":"double","required":true},
            "dodging": {"dataType":"double","required":true},
            "blocking": {"dataType":"double","required":true},
            "speed": {"dataType":"double","required":true},
            "positional_sense": {"dataType":"double","required":true},
            "teamwork": {"dataType":"double","required":true},
            "clutch_factor": {"dataType":"double","required":true},
            "throwing_potential": {"dataType":"double","required":true},
            "catching_potential": {"dataType":"double","required":true},
            "dodging_potential": {"dataType":"double","required":true},
            "blocking_potential": {"dataType":"double","required":true},
            "speed_potential": {"dataType":"double","required":true},
            "positional_sense_potential": {"dataType":"double","required":true},
            "teamwork_potential": {"dataType":"double","required":true},
            "clutch_factor_potential": {"dataType":"double","required":true},
            "tier": {"dataType":"double","required":true},
            "potential_tier": {"dataType":"double","required":true},
            "created_at": {"dataType":"string","required":true},
            "updated_at": {"dataType":"string","required":true},
            "buy_price": {"dataType":"double","required":true},
            "sell_price": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetTransferListResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "transfer_list": {"dataType":"array","array":{"dataType":"refObject","ref":"TransferListedPlayer"},"required":true},
            "season": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Player": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "game_id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "status": {"ref":"PlayerStatus","required":true},
            "throwing": {"dataType":"double","required":true},
            "catching": {"dataType":"double","required":true},
            "dodging": {"dataType":"double","required":true},
            "blocking": {"dataType":"double","required":true},
            "speed": {"dataType":"double","required":true},
            "positional_sense": {"dataType":"double","required":true},
            "teamwork": {"dataType":"double","required":true},
            "clutch_factor": {"dataType":"double","required":true},
            "throwing_potential": {"dataType":"double","required":true},
            "catching_potential": {"dataType":"double","required":true},
            "dodging_potential": {"dataType":"double","required":true},
            "blocking_potential": {"dataType":"double","required":true},
            "speed_potential": {"dataType":"double","required":true},
            "positional_sense_potential": {"dataType":"double","required":true},
            "teamwork_potential": {"dataType":"double","required":true},
            "clutch_factor_potential": {"dataType":"double","required":true},
            "tier": {"dataType":"double","required":true},
            "potential_tier": {"dataType":"double","required":true},
            "created_at": {"dataType":"string","required":true},
            "updated_at": {"dataType":"string","required":true},
            "buy_price": {"dataType":"double","required":true},
            "sell_price": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BuyTransferListedPlayerResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "player": {"ref":"Player","required":true},
            "budget_remaining": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BuyTransferListedPlayerRequest": {
        "dataType": "refObject",
        "properties": {
            "player_id": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SellPlayerResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "sold_player": {"ref":"Player","required":true},
            "budget": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SellPlayerRequest": {
        "dataType": "refObject",
        "properties": {
            "player_id": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetSeasonTrainingInfoResponseModel": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "season_number": {"dataType":"double","required":true},
            "team_id": {"dataType":"string","required":true},
            "training_facility_level": {"dataType":"double","required":true},
            "training_credits_used": {"dataType":"double","required":true},
            "training_credits_available": {"dataType":"double","required":true},
            "training_credits_remaining": {"dataType":"double","required":true},
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SeasonTrainingInfo": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "season_number": {"dataType":"double","required":true},
            "team_id": {"dataType":"string","required":true},
            "training_facility_level": {"dataType":"double","required":true},
            "training_credits_used": {"dataType":"double","required":true},
            "training_credits_available": {"dataType":"double","required":true},
            "training_credits_remaining": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TrainPlayerResponseModel": {
        "dataType": "refObject",
        "properties": {
            "player": {"ref":"Player","required":true},
            "season": {"ref":"SeasonTrainingInfo","required":true},
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlayerStatName": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["throwing"]},{"dataType":"enum","enums":["catching"]},{"dataType":"enum","enums":["dodging"]},{"dataType":"enum","enums":["blocking"]},{"dataType":"enum","enums":["speed"]},{"dataType":"enum","enums":["positional_sense"]},{"dataType":"enum","enums":["teamwork"]},{"dataType":"enum","enums":["clutch_factor"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TrainPlayerRequestModel": {
        "dataType": "refObject",
        "properties": {
            "player_id": {"dataType":"string","required":true},
            "stat_name": {"ref":"PlayerStatName","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GameStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pending"]},{"dataType":"enum","enums":["in_progress"]},{"dataType":"enum","enums":["completed"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GameStage": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["draft"]},{"dataType":"enum","enums":["pre_season"]},{"dataType":"enum","enums":["regular_season"]},{"dataType":"enum","enums":["post_season"]},{"dataType":"enum","enums":["off_season"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FixtureModel": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "game_id": {"dataType":"string","required":true},
            "season": {"dataType":"double","required":true},
            "match_day": {"dataType":"double","required":true},
            "home_team_id": {"dataType":"string","required":true},
            "away_team_id": {"dataType":"string","required":true},
            "home_team_type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["user"]},{"dataType":"enum","enums":["opponent"]}],"required":true},
            "away_team_type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["user"]},{"dataType":"enum","enums":["opponent"]}],"required":true},
            "home_score": {"dataType":"double"},
            "away_score": {"dataType":"double"},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["scheduled"]},{"dataType":"enum","enums":["completed"]}],"required":true},
            "played_at": {"dataType":"string"},
            "created_at": {"dataType":"string","required":true},
            "home_team_name": {"dataType":"string"},
            "away_team_name": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LeagueTableEntryModel": {
        "dataType": "refObject",
        "properties": {
            "team_id": {"dataType":"string","required":true},
            "team_name": {"dataType":"string","required":true},
            "team_type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["user"]},{"dataType":"enum","enums":["opponent"]}],"required":true},
            "played": {"dataType":"double","required":true},
            "won": {"dataType":"double","required":true},
            "lost": {"dataType":"double","required":true},
            "points": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StartMainSeasonResponseModel": {
        "dataType": "refObject",
        "properties": {
            "game": {"dataType":"nestedObjectLiteral","nestedProperties":{"game_stage":{"ref":"GameStage","required":true},"status":{"ref":"GameStatus","required":true},"match_day":{"dataType":"double","required":true},"season":{"dataType":"double","required":true},"id":{"dataType":"string","required":true}},"required":true},
            "fixtures": {"dataType":"array","array":{"dataType":"refObject","ref":"FixtureModel"},"required":true},
            "table": {"dataType":"array","array":{"dataType":"refObject","ref":"LeagueTableEntryModel"},"required":true},
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EndSeasonResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "game_ended": {"dataType":"boolean","required":true},
            "season_completed": {"dataType":"double","required":true},
            "next_season": {"dataType":"double"},
            "promoted": {"dataType":"boolean"},
            "champion": {"dataType":"boolean"},
            "budget_update": {"dataType":"nestedObjectLiteral","nestedProperties":{"new_budget":{"dataType":"double","required":true},"wages_paid":{"dataType":"double","required":true},"stadium_income":{"dataType":"double","required":true},"previous":{"dataType":"double","required":true}}},
            "promoted_team": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetSeasonScoutingInfoResponseModel": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "season_number": {"dataType":"double","required":true},
            "team_id": {"dataType":"string","required":true},
            "scout_level": {"dataType":"double","required":true},
            "scouting_credits_used": {"dataType":"double","required":true},
            "scouting_credits_available": {"dataType":"double","required":true},
            "scouting_credits_remaining": {"dataType":"double","required":true},
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ScoutedPlayer": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "player_id": {"dataType":"string","required":true},
            "season_id": {"dataType":"string","required":true},
            "is_purchased": {"dataType":"boolean","required":true},
            "scout_price": {"dataType":"double","required":true},
            "buy_price": {"dataType":"double","required":true},
            "created_at": {"dataType":"string","required":true},
            "updated_at": {"dataType":"string","required":true},
            "player": {"ref":"Player"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetScoutedPlayersResponseModel": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "scouted_players": {"dataType":"array","array":{"dataType":"refObject","ref":"ScoutedPlayer"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ScoutPlayersResponseModel": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "scouted_players": {"dataType":"array","array":{"dataType":"refObject","ref":"ScoutedPlayer"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ScoutPlayersRequestModel": {
        "dataType": "refObject",
        "properties": {
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PurchaseScoutedPlayerResponseModel": {
        "dataType": "refObject",
        "properties": {
            "result": {"dataType":"nestedObjectLiteral","nestedProperties":{"team_budget":{"dataType":"double","required":true},"player":{"ref":"Player","required":true}},"required":true},
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PurchaseScoutedPlayerRequestModel": {
        "dataType": "refObject",
        "properties": {
            "scouted_player_id": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetDraftPlayersResponseModel": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "players": {"dataType":"array","array":{"dataType":"refObject","ref":"Player"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompleteDraftResponseModel": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "team_id": {"dataType":"string","required":true},
            "selected_players": {"dataType":"array","array":{"dataType":"refObject","ref":"Player"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CompleteDraftRequestModel": {
        "dataType": "refObject",
        "properties": {
            "player_ids": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetSquadResponseModel": {
        "dataType": "refObject",
        "properties": {
            "players": {"dataType":"array","array":{"dataType":"refObject","ref":"Player"},"required":true},
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EnhancedFixture": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "game_id": {"dataType":"string","required":true},
            "season": {"dataType":"double","required":true},
            "match_day": {"dataType":"double","required":true},
            "home_team_id": {"dataType":"string","required":true},
            "away_team_id": {"dataType":"string","required":true},
            "home_team_type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["user"]},{"dataType":"enum","enums":["opponent"]}],"required":true},
            "away_team_type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["user"]},{"dataType":"enum","enums":["opponent"]}],"required":true},
            "home_score": {"dataType":"double"},
            "away_score": {"dataType":"double"},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["scheduled"]},{"dataType":"enum","enums":["completed"]}],"required":true},
            "played_at": {"dataType":"string"},
            "created_at": {"dataType":"string","required":true},
            "home_team_name": {"dataType":"string","required":true},
            "away_team_name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TargetPriority": {
        "dataType": "refEnum",
        "enums": ["highest_threat","weakest_defence","nearest","random"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlayerState": {
        "dataType": "refObject",
        "properties": {
            "throw_aggression": {"dataType":"double","required":true},
            "catch_aggression": {"dataType":"double","required":true},
            "target_priority": {"ref":"TargetPriority","required":true},
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "isHome": {"dataType":"boolean","required":true},
            "throwing": {"dataType":"double","required":true},
            "catching": {"dataType":"double","required":true},
            "dodging": {"dataType":"double","required":true},
            "blocking": {"dataType":"double","required":true},
            "speed": {"dataType":"double","required":true},
            "positionalSense": {"dataType":"double","required":true},
            "teamwork": {"dataType":"double","required":true},
            "clutchFactor": {"dataType":"double","required":true},
            "position": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "eliminated": {"dataType":"boolean","required":true},
            "ballId": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.PlayerState_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"PlayerState"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BallStatus": {
        "dataType": "refEnum",
        "enums": ["initial","free","held"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BallState": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"BallStatus","required":true},
            "position": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_number.BallState_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"BallState"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RoundState": {
        "dataType": "refObject",
        "properties": {
            "turnOrder": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_GameState_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"gameNumber":{"dataType":"double"},"playerState":{"ref":"Record_string.PlayerState_"},"ballState":{"ref":"Record_number.BallState_"},"roundState":{"ref":"RoundState"},"completed":{"dataType":"boolean"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlayerAction": {
        "dataType": "refEnum",
        "enums": ["throw","pick_up","prepare"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlayerReaction": {
        "dataType": "refEnum",
        "enums": ["catch","dodge","block"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActionResult": {
        "dataType": "refEnum",
        "enums": ["hit","miss","caught","blocked","picked_up","prepared"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DeepPartial_PlayerState_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"position":{"dataType":"double"},"eliminated":{"dataType":"boolean"},"ballId":{"dataType":"double"},"id":{"dataType":"string"},"name":{"dataType":"string"},"isHome":{"dataType":"boolean"},"throwing":{"dataType":"double"},"catching":{"dataType":"double"},"dodging":{"dataType":"double"},"blocking":{"dataType":"double"},"speed":{"dataType":"double"},"positionalSense":{"dataType":"double"},"teamwork":{"dataType":"double"},"clutchFactor":{"dataType":"double"},"throw_aggression":{"dataType":"double"},"catch_aggression":{"dataType":"double"},"target_priority":{"ref":"TargetPriority"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DeepPartial_Record_string.PlayerState__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"DeepPartial_PlayerState_"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DeepPartial_BallState_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"status":{"ref":"BallStatus"},"position":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DeepPartial_Record_number.BallState__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"DeepPartial_BallState_"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DeepPartial_RoundState_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"turnOrder":{"dataType":"array","array":{"dataType":"string"}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DeepPartial_GameState_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"gameNumber":{"dataType":"double"},"playerState":{"ref":"DeepPartial_Record_string.PlayerState__"},"ballState":{"ref":"DeepPartial_Record_number.BallState__"},"roundState":{"ref":"DeepPartial_RoundState_"},"completed":{"dataType":"boolean"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TsoaTurn": {
        "dataType": "refObject",
        "properties": {
            "playerId": {"dataType":"string","required":true},
            "action": {"ref":"PlayerAction","required":true},
            "reaction": {"ref":"PlayerReaction"},
            "newPosition": {"dataType":"double"},
            "eliminatedPlayerId": {"dataType":"string"},
            "reEnteredPlayerId": {"dataType":"string"},
            "ballId": {"dataType":"double"},
            "actionResult": {"ref":"ActionResult"},
            "targetPlayerId": {"dataType":"string"},
            "endTurnGameStateUpdate": {"ref":"Partial_GameState_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Turn": {
        "dataType": "refObject",
        "properties": {
            "playerId": {"dataType":"string","required":true},
            "action": {"ref":"PlayerAction","required":true},
            "reaction": {"ref":"PlayerReaction"},
            "newPosition": {"dataType":"double"},
            "eliminatedPlayerId": {"dataType":"string"},
            "reEnteredPlayerId": {"dataType":"string"},
            "ballId": {"dataType":"double"},
            "actionResult": {"ref":"ActionResult"},
            "targetPlayerId": {"dataType":"string"},
            "endTurnGameStateUpdate": {"ref":"DeepPartial_GameState_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TsoaRound": {
        "dataType": "refObject",
        "properties": {
            "turns": {"dataType":"array","array":{"dataType":"refObject","ref":"TsoaTurn"},"required":true},
            "initialRoundState": {"ref":"RoundState","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_MatchState_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"currentGame":{"dataType":"double"},"completed":{"dataType":"boolean"},"homeScore":{"dataType":"double"},"awayScore":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Round": {
        "dataType": "refObject",
        "properties": {
            "turns": {"dataType":"array","array":{"dataType":"refObject","ref":"Turn"},"required":true},
            "initialRoundState": {"ref":"RoundState","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GameState": {
        "dataType": "refObject",
        "properties": {
            "gameNumber": {"dataType":"double","required":true},
            "playerState": {"ref":"Record_string.PlayerState_","required":true},
            "ballState": {"ref":"Record_number.BallState_","required":true},
            "roundState": {"ref":"RoundState","required":true},
            "completed": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DeepPartial_MatchState_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"currentGame":{"dataType":"double"},"completed":{"dataType":"boolean"},"homeScore":{"dataType":"double"},"awayScore":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TsoaGame": {
        "dataType": "refObject",
        "properties": {
            "gameNumber": {"dataType":"double","required":true},
            "rounds": {"dataType":"array","array":{"dataType":"refObject","ref":"TsoaRound"},"required":true},
            "homeTeamPlayersRemaining": {"dataType":"double","required":true},
            "awayTeamPlayersRemaining": {"dataType":"double","required":true},
            "winner": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":["tie"]},{"dataType":"enum","enums":[null]}],"required":true},
            "initialGameState": {"ref":"GameState","required":true},
            "endGameMatchStateUpdate": {"ref":"Partial_MatchState_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchPlayer": {
        "dataType": "refObject",
        "properties": {
            "throw_aggression": {"dataType":"double","required":true},
            "catch_aggression": {"dataType":"double","required":true},
            "target_priority": {"ref":"TargetPriority","required":true},
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "isHome": {"dataType":"boolean","required":true},
            "throwing": {"dataType":"double","required":true},
            "catching": {"dataType":"double","required":true},
            "dodging": {"dataType":"double","required":true},
            "blocking": {"dataType":"double","required":true},
            "speed": {"dataType":"double","required":true},
            "positionalSense": {"dataType":"double","required":true},
            "teamwork": {"dataType":"double","required":true},
            "clutchFactor": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Team": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "players": {"dataType":"array","array":{"dataType":"refObject","ref":"MatchPlayer"},"required":true},
            "isHome": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Game": {
        "dataType": "refObject",
        "properties": {
            "gameNumber": {"dataType":"double","required":true},
            "rounds": {"dataType":"array","array":{"dataType":"refObject","ref":"Round"},"required":true},
            "homeTeamPlayersRemaining": {"dataType":"double","required":true},
            "awayTeamPlayersRemaining": {"dataType":"double","required":true},
            "winner": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":["tie"]},{"dataType":"enum","enums":[null]}],"required":true},
            "initialGameState": {"ref":"GameState","required":true},
            "endGameMatchStateUpdate": {"ref":"DeepPartial_MatchState_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchState": {
        "dataType": "refObject",
        "properties": {
            "currentGame": {"dataType":"double","required":true},
            "completed": {"dataType":"boolean","required":true},
            "homeScore": {"dataType":"double","required":true},
            "awayScore": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchSimulationResponse": {
        "dataType": "refObject",
        "properties": {
            "homeTeam": {"ref":"Team","required":true},
            "awayTeam": {"ref":"Team","required":true},
            "homeScore": {"dataType":"double","required":true},
            "awayScore": {"dataType":"double","required":true},
            "winner": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "games": {"dataType":"array","array":{"dataType":"refObject","ref":"TsoaGame"},"required":true},
            "initialMatchState": {"ref":"MatchState","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlayMatchResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "match": {"ref":"EnhancedFixture","required":true},
            "match_day": {"dataType":"double","required":true},
            "other_match": {"ref":"EnhancedFixture"},
            "simulated_match": {"ref":"MatchSimulationResponse"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SavePlayerinstructionsResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SavePlayerinstructionsRequest": {
        "dataType": "refObject",
        "properties": {
            "fixture_id": {"dataType":"string"},
            "players": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"target_priority":{"ref":"TargetPriority","required":true},"catch_aggression":{"dataType":"double","required":true},"throw_aggression":{"dataType":"double","required":true},"player_id":{"dataType":"string","required":true}}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlayerInstructions": {
        "dataType": "refObject",
        "properties": {
            "throw_aggression": {"dataType":"double","required":true},
            "catch_aggression": {"dataType":"double","required":true},
            "target_priority": {"ref":"TargetPriority","required":true},
            "id": {"dataType":"string","required":true},
            "fixture_id": {"dataType":"string","required":true},
            "player_id": {"dataType":"string","required":true},
            "created_at": {"dataType":"string"},
            "updated_at": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetPlayerinstructionsResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "player_instructions": {"dataType":"array","array":{"dataType":"refObject","ref":"PlayerInstructions"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetLeagueResponseModel": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "season": {"dataType":"double","required":true},
            "fixtures": {"dataType":"array","array":{"dataType":"refObject","ref":"FixtureModel"},"required":true},
            "table": {"dataType":"array","array":{"dataType":"refObject","ref":"LeagueTableEntryModel"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CurrentGameResponseModel": {
        "dataType": "refObject",
        "properties": {
            "game_id": {"dataType":"string","required":true},
            "game_season": {"dataType":"double","required":true},
            "game_match_day": {"dataType":"double","required":true},
            "game_status": {"ref":"GameStatus","required":true},
            "game_stage": {"ref":"GameStage","required":true},
            "team_id": {"dataType":"string","required":true},
            "team_name": {"dataType":"string","required":true},
            "budget": {"dataType":"double","required":true},
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateTeamResponseModel": {
        "dataType": "refObject",
        "properties": {
            "team_id": {"dataType":"string","required":true},
            "team_name": {"dataType":"string","required":true},
            "game_id": {"dataType":"string","required":true},
            "game_season": {"dataType":"double","required":true},
            "game_match_day": {"dataType":"double","required":true},
            "game_status": {"ref":"GameStatus","required":true},
            "game_stage": {"ref":"GameStage","required":true},
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateTeamRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CancelGameResponseModel": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetFacilityInfoResponseModel": {
        "dataType": "refObject",
        "properties": {
            "training_facility_level": {"dataType":"double","required":true},
            "scout_level": {"dataType":"double","required":true},
            "stadium_size": {"dataType":"double","required":true},
            "training_facility_upgrade_cost": {"dataType":"double","required":true},
            "scout_upgrade_cost": {"dataType":"double","required":true},
            "stadium_upgrade_cost": {"dataType":"double","required":true},
            "can_afford_training_upgrade": {"dataType":"boolean","required":true},
            "can_afford_scout_upgrade": {"dataType":"boolean","required":true},
            "can_afford_stadium_upgrade": {"dataType":"boolean","required":true},
            "budget": {"dataType":"double","required":true},
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpgradeFacilityResponseModel": {
        "dataType": "refObject",
        "properties": {
            "team": {"dataType":"nestedObjectLiteral","nestedProperties":{"scout_level":{"dataType":"double"},"training_facility_level":{"dataType":"double"},"budget":{"dataType":"double","required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}},"required":true},
            "cost": {"dataType":"double","required":true},
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpgradeFacilityRequestModel": {
        "dataType": "refObject",
        "properties": {
            "facility_type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["training"]},{"dataType":"enum","enums":["scout"]},{"dataType":"enum","enums":["stadium"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsTransferController_getTransferList: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/transfers',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TransferController)),
            ...(fetchMiddlewares<RequestHandler>(TransferController.prototype.getTransferList)),

            async function TransferController_getTransferList(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTransferController_getTransferList, request, response });

                const controller = new TransferController();

              await templateService.apiHandler({
                methodName: 'getTransferList',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTransferController_buyPlayer: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"BuyTransferListedPlayerRequest"},
        };
        app.post('/api/transfers/buy',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TransferController)),
            ...(fetchMiddlewares<RequestHandler>(TransferController.prototype.buyPlayer)),

            async function TransferController_buyPlayer(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTransferController_buyPlayer, request, response });

                const controller = new TransferController();

              await templateService.apiHandler({
                methodName: 'buyPlayer',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTransferController_sellPlayer: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"SellPlayerRequest"},
        };
        app.post('/api/transfers/sell',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TransferController)),
            ...(fetchMiddlewares<RequestHandler>(TransferController.prototype.sellPlayer)),

            async function TransferController_sellPlayer(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTransferController_sellPlayer, request, response });

                const controller = new TransferController();

              await templateService.apiHandler({
                methodName: 'sellPlayer',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTrainingController_getSeasonTrainingInfo: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/training/training-info',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TrainingController)),
            ...(fetchMiddlewares<RequestHandler>(TrainingController.prototype.getSeasonTrainingInfo)),

            async function TrainingController_getSeasonTrainingInfo(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTrainingController_getSeasonTrainingInfo, request, response });

                const controller = new TrainingController();

              await templateService.apiHandler({
                methodName: 'getSeasonTrainingInfo',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTrainingController_trainPlayer: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"TrainPlayerRequestModel"},
        };
        app.post('/api/training/train-player',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TrainingController)),
            ...(fetchMiddlewares<RequestHandler>(TrainingController.prototype.trainPlayer)),

            async function TrainingController_trainPlayer(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTrainingController_trainPlayer, request, response });

                const controller = new TrainingController();

              await templateService.apiHandler({
                methodName: 'trainPlayer',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSeasonController_startMainSeason: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/seasons/start-main-season',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SeasonController)),
            ...(fetchMiddlewares<RequestHandler>(SeasonController.prototype.startMainSeason)),

            async function SeasonController_startMainSeason(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSeasonController_startMainSeason, request, response });

                const controller = new SeasonController();

              await templateService.apiHandler({
                methodName: 'startMainSeason',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSeasonController_endSeason: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/seasons/end-season',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SeasonController)),
            ...(fetchMiddlewares<RequestHandler>(SeasonController.prototype.endSeason)),

            async function SeasonController_endSeason(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSeasonController_endSeason, request, response });

                const controller = new SeasonController();

              await templateService.apiHandler({
                methodName: 'endSeason',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsScoutingController_getSeasonScoutingInfo: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/scouting/scouting-info',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ScoutingController)),
            ...(fetchMiddlewares<RequestHandler>(ScoutingController.prototype.getSeasonScoutingInfo)),

            async function ScoutingController_getSeasonScoutingInfo(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsScoutingController_getSeasonScoutingInfo, request, response });

                const controller = new ScoutingController();

              await templateService.apiHandler({
                methodName: 'getSeasonScoutingInfo',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsScoutingController_getScoutedPlayers: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/scouting/scouted-players',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ScoutingController)),
            ...(fetchMiddlewares<RequestHandler>(ScoutingController.prototype.getScoutedPlayers)),

            async function ScoutingController_getScoutedPlayers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsScoutingController_getScoutedPlayers, request, response });

                const controller = new ScoutingController();

              await templateService.apiHandler({
                methodName: 'getScoutedPlayers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsScoutingController_scoutPlayers: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"ScoutPlayersRequestModel"},
        };
        app.post('/api/scouting/scout-players',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ScoutingController)),
            ...(fetchMiddlewares<RequestHandler>(ScoutingController.prototype.scoutPlayers)),

            async function ScoutingController_scoutPlayers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsScoutingController_scoutPlayers, request, response });

                const controller = new ScoutingController();

              await templateService.apiHandler({
                methodName: 'scoutPlayers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsScoutingController_purchaseScoutedPlayer: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"PurchaseScoutedPlayerRequestModel"},
        };
        app.post('/api/scouting/purchase-scouted-player',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ScoutingController)),
            ...(fetchMiddlewares<RequestHandler>(ScoutingController.prototype.purchaseScoutedPlayer)),

            async function ScoutingController_purchaseScoutedPlayer(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsScoutingController_purchaseScoutedPlayer, request, response });

                const controller = new ScoutingController();

              await templateService.apiHandler({
                methodName: 'purchaseScoutedPlayer',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPlayerController_getDraftPlayers: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/players/draft',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PlayerController)),
            ...(fetchMiddlewares<RequestHandler>(PlayerController.prototype.getDraftPlayers)),

            async function PlayerController_getDraftPlayers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPlayerController_getDraftPlayers, request, response });

                const controller = new PlayerController();

              await templateService.apiHandler({
                methodName: 'getDraftPlayers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPlayerController_completeDraft: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                draftData: {"in":"body","name":"draftData","required":true,"ref":"CompleteDraftRequestModel"},
        };
        app.post('/api/players/draft/complete',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PlayerController)),
            ...(fetchMiddlewares<RequestHandler>(PlayerController.prototype.completeDraft)),

            async function PlayerController_completeDraft(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPlayerController_completeDraft, request, response });

                const controller = new PlayerController();

              await templateService.apiHandler({
                methodName: 'completeDraft',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPlayerController_getSquad: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/players/squad',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PlayerController)),
            ...(fetchMiddlewares<RequestHandler>(PlayerController.prototype.getSquad)),

            async function PlayerController_getSquad(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPlayerController_getSquad, request, response });

                const controller = new PlayerController();

              await templateService.apiHandler({
                methodName: 'getSquad',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMatchController_playNextMatch: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/matches/play-next',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchController)),
            ...(fetchMiddlewares<RequestHandler>(MatchController.prototype.playNextMatch)),

            async function MatchController_playNextMatch(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMatchController_playNextMatch, request, response });

                const controller = new MatchController();

              await templateService.apiHandler({
                methodName: 'playNextMatch',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMatchController_savePlayerInstructions: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"SavePlayerinstructionsRequest"},
        };
        app.post('/api/matches/save-player-instructions',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchController)),
            ...(fetchMiddlewares<RequestHandler>(MatchController.prototype.savePlayerInstructions)),

            async function MatchController_savePlayerInstructions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMatchController_savePlayerInstructions, request, response });

                const controller = new MatchController();

              await templateService.apiHandler({
                methodName: 'savePlayerInstructions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMatchController_getPlayerInstructions: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                fixtureId: {"in":"query","name":"fixtureId","dataType":"string"},
        };
        app.get('/api/matches/player-instructions',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MatchController)),
            ...(fetchMiddlewares<RequestHandler>(MatchController.prototype.getPlayerInstructions)),

            async function MatchController_getPlayerInstructions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMatchController_getPlayerInstructions, request, response });

                const controller = new MatchController();

              await templateService.apiHandler({
                methodName: 'getPlayerInstructions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLeagueController_getLeague: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                season: {"in":"query","name":"season","dataType":"double"},
        };
        app.get('/api/leagues',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(LeagueController)),
            ...(fetchMiddlewares<RequestHandler>(LeagueController.prototype.getLeague)),

            async function LeagueController_getLeague(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLeagueController_getLeague, request, response });

                const controller = new LeagueController();

              await templateService.apiHandler({
                methodName: 'getLeague',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGameController_getCurrentGame: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/games/current',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GameController)),
            ...(fetchMiddlewares<RequestHandler>(GameController.prototype.getCurrentGame)),

            async function GameController_getCurrentGame(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGameController_getCurrentGame, request, response });

                const controller = new GameController();

              await templateService.apiHandler({
                methodName: 'getCurrentGame',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGameController_createTeam: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                teamData: {"in":"body","name":"teamData","required":true,"ref":"CreateTeamRequest"},
        };
        app.post('/api/games/teams',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GameController)),
            ...(fetchMiddlewares<RequestHandler>(GameController.prototype.createTeam)),

            async function GameController_createTeam(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGameController_createTeam, request, response });

                const controller = new GameController();

              await templateService.apiHandler({
                methodName: 'createTeam',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGameController_cancelGame: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/games/cancel',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GameController)),
            ...(fetchMiddlewares<RequestHandler>(GameController.prototype.cancelGame)),

            async function GameController_cancelGame(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGameController_cancelGame, request, response });

                const controller = new GameController();

              await templateService.apiHandler({
                methodName: 'cancelGame',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFacilitiesController_getFacilityInfo: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/facilities/facility-info',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(FacilitiesController)),
            ...(fetchMiddlewares<RequestHandler>(FacilitiesController.prototype.getFacilityInfo)),

            async function FacilitiesController_getFacilityInfo(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFacilitiesController_getFacilityInfo, request, response });

                const controller = new FacilitiesController();

              await templateService.apiHandler({
                methodName: 'getFacilityInfo',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFacilitiesController_upgradeFacility: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpgradeFacilityRequestModel"},
        };
        app.post('/api/facilities/upgrade-facility',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(FacilitiesController)),
            ...(fetchMiddlewares<RequestHandler>(FacilitiesController.prototype.upgradeFacility)),

            async function FacilitiesController_upgradeFacility(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFacilitiesController_upgradeFacility, request, response });

                const controller = new FacilitiesController();

              await templateService.apiHandler({
                methodName: 'upgradeFacility',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await Promise.any(secMethodOrPromises);

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }

                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
