<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once(APPPATH.'libraries/REST_Controller.php');

class User extends REST_Controller {

    function __construct(){
        parent::__construct();
        $this->load->model("user_model");
        $this->load->model("weight_plan_model");
    }

    public function index_get() {

        $userId = $this->get("id");
        $externalId = $this->get("externalId");
        $response = new stdClass();

        if (empty($userId) && empty($externalId )) {
            $this->response(array("error" => "missing any id"), 500);
            return;
        }

        if (!empty($userId)) {
            $user = $this->user_model->getById($userId); 
        } else {
            $user = $this->user_model->getByExternalId($externalId);
        }

        if (empty($user)) {
            $this->response($response);
            return;
        }

        $response->id = $user->id;
        $response->currentWeight = $this->user_model->getLastWeight($response->id);

        if (!empty($user->weight_plan_id)) {
            $user->weightPlan = $this->weight_plan_model->getById($user->weight_plan_id);
            if (!empty($user->weightPlan->start_date) && !empty($user->weightPlan->end_date)) {
                if (!empty($user->weightPlan->watch_from_date)) {
                    $user->weightPlan->weights = $this->user_model->getWeightsById($user->id, $user->weightPlan->watch_from_date, $user->weightPlan->end_date);
                }else {
                    $user->weightPlan->weights = $this->user_model->getWeightsById($user->id, $user->weightPlan->start_date, $user->weightPlan->end_date);
                }
            }
        }

        if (!empty($user->weightPlan)) {
            $response->weightPlan = new stdClass();
            $response->weightPlan->id = $user->weightPlan->id;
            $response->weightPlan->startWeight = $user->weightPlan->start_weight;
            $response->weightPlan->endWeight = $user->weightPlan->end_weight;
            $response->weightPlan->startDate = $user->weightPlan->start_date;
            $response->weightPlan->endDate = $user->weightPlan->end_date;
            $response->weightPlan->watchFromDate = $user->weightPlan->watch_from_date;
            $response->weightPlan->weights = $user->weightPlan->weights;
        }

        $this->response($response);

    }

    public function index_post() {

        $externalId = $this->post("externalId");
        $response = new stdClass();

        $userId = $this->user_model->create(array(
            "external_id" => $externalId,
        ));

        $response->id = $userId;
        $response->externalId = $externalId;

        $this->response($response);

    }

}