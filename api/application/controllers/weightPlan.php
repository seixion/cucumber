<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once(APPPATH.'libraries/REST_Controller.php');

class WeightPlan extends REST_Controller {

    function __construct(){
        parent::__construct();
        $this->load->model("user_model");
        $this->load->model("weight_plan_model");
    }

    public function index_post() {

        $userId = $this->post("userId");

        $weightPlan = array(
            "startDate" => $this->post("startDate"),
            "endDate" => $this->post("endDate"),
            "startWeight" => (float)$this->post("startWeight"),
            "endWeight" => (float)$this->post("endWeight"),
        );
        $watchFromDate = $this->post("watchFromDate");
        if (!empty($watchFromDate)) {
            $weightPlan["watchFromDate"] = $watchFromDate;
        }

        $weightPlanId = $this->weight_plan_model->create($weightPlan);
        $this->user_model->setWeightPlan($userId, $weightPlanId);

        header("HTTP/1.1 204");
        $this->response(204);

    }

    public function index_put() {

        $userId = $this->put("userId");

        $weightPlan = array(
            "startDate" => $this->put("startDate"),
            "endDate" => $this->put("endDate"),
            "startWeight" => (float)$this->put("startWeight"),
            "endWeight" => (float)$this->put("endWeight")
        );
        $watchFromDate = $this->put("watchFromDate");
        if (!empty($watchFromDate)) {
            $weightPlan["watchFromDate"] = $watchFromDate;
        }

        $weightPlan["id"] = (int)$this->user_model->getWeightPlan($userId)->weight_plan_id;

        $this->weight_plan_model->update($weightPlan);

        header("HTTP/1.1 204");
        $this->response(204);

    }

    // FIXME this id_delete thing is weird... 
    // HTTP delete is not allowed to pass data... fine so I want to add my id 
    // to the url but CI is converting /weightPlan/51 to be.. 51_weightplan?
    // so it takes the first part of the url after the resource and prefixes here.. anyway its weird
    public function id_delete($id) {

        $user = $this->user_model->getByWeightPlanId($id);
        $this->weight_plan_model->delete($id);
        $this->user_model->setWeightPlan($user->id, null);

        header("HTTP/1.1 204");
        $this->response(204);

    }

}