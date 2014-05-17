<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once(APPPATH.'libraries/REST_Controller.php');

class UserWeight extends REST_Controller {

    function __construct(){
        parent::__construct();
        $this->load->model("user_model");
    }

    public function index_post() {

        $userId = $this->post("userId");
        $weight = $this->post("weight");
        $date = $this->post("date");

        $this->user_model->addWeight($userId, $date, $weight);

        header("HTTP/1.1 204");
        $this->response(204);

    }

}