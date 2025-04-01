/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SeasonController } from './../controllers/season.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PlayerController } from './../controllers/player.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LeagueController } from './../controllers/league.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GameController } from './../controllers/game.controller';
import { expressAuthentication } from './../middleware/auth.middleware';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
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
    "PlayerStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["draft"]},{"dataType":"enum","enums":["team"]},{"dataType":"enum","enums":["opponent"]},{"dataType":"enum","enums":["scout"]},{"dataType":"enum","enums":["transfer"]},{"dataType":"enum","enums":["sold"]},{"dataType":"enum","enums":["rejected"]}],"validators":{}},
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
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsSeasonController_getSeasonTrainingInfo: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/seasons/training-info',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SeasonController)),
            ...(fetchMiddlewares<RequestHandler>(SeasonController.prototype.getSeasonTrainingInfo)),

            async function SeasonController_getSeasonTrainingInfo(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSeasonController_getSeasonTrainingInfo, request, response });

                const controller = new SeasonController();

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
        const argsSeasonController_trainPlayer: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"TrainPlayerRequestModel"},
        };
        app.post('/api/seasons/train-player',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SeasonController)),
            ...(fetchMiddlewares<RequestHandler>(SeasonController.prototype.trainPlayer)),

            async function SeasonController_trainPlayer(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSeasonController_trainPlayer, request, response });

                const controller = new SeasonController();

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
        const argsSeasonController_getSeasonScoutingInfo: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/seasons/scouting-info',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SeasonController)),
            ...(fetchMiddlewares<RequestHandler>(SeasonController.prototype.getSeasonScoutingInfo)),

            async function SeasonController_getSeasonScoutingInfo(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSeasonController_getSeasonScoutingInfo, request, response });

                const controller = new SeasonController();

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
        const argsSeasonController_getScoutedPlayers: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/seasons/scouted-players',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SeasonController)),
            ...(fetchMiddlewares<RequestHandler>(SeasonController.prototype.getScoutedPlayers)),

            async function SeasonController_getScoutedPlayers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSeasonController_getScoutedPlayers, request, response });

                const controller = new SeasonController();

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
        const argsSeasonController_scoutPlayers: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"ScoutPlayersRequestModel"},
        };
        app.post('/api/seasons/scout-players',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SeasonController)),
            ...(fetchMiddlewares<RequestHandler>(SeasonController.prototype.scoutPlayers)),

            async function SeasonController_scoutPlayers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSeasonController_scoutPlayers, request, response });

                const controller = new SeasonController();

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
        const argsSeasonController_purchaseScoutedPlayer: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"PurchaseScoutedPlayerRequestModel"},
        };
        app.post('/api/seasons/purchase-scouted-player',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SeasonController)),
            ...(fetchMiddlewares<RequestHandler>(SeasonController.prototype.purchaseScoutedPlayer)),

            async function SeasonController_purchaseScoutedPlayer(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSeasonController_purchaseScoutedPlayer, request, response });

                const controller = new SeasonController();

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
        const argsSeasonController_getFacilityInfo: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/seasons/facility-info',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SeasonController)),
            ...(fetchMiddlewares<RequestHandler>(SeasonController.prototype.getFacilityInfo)),

            async function SeasonController_getFacilityInfo(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSeasonController_getFacilityInfo, request, response });

                const controller = new SeasonController();

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
        const argsSeasonController_upgradeFacility: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpgradeFacilityRequestModel"},
        };
        app.post('/api/seasons/upgrade-facility',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SeasonController)),
            ...(fetchMiddlewares<RequestHandler>(SeasonController.prototype.upgradeFacility)),

            async function SeasonController_upgradeFacility(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSeasonController_upgradeFacility, request, response });

                const controller = new SeasonController();

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
        const argsGameController_startMainSeason: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/games/start-main-season',
            authenticateMiddleware([{"bearerAuth":[]}]),
            ...(fetchMiddlewares<RequestHandler>(GameController)),
            ...(fetchMiddlewares<RequestHandler>(GameController.prototype.startMainSeason)),

            async function GameController_startMainSeason(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGameController_startMainSeason, request, response });

                const controller = new GameController();

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
