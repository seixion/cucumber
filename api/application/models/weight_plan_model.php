<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Weight_plan_model extends CI_Model {

    function __construct(){
        parent::__construct();
    }

    public function getById($id) {

        $this->db->from("weight_plan")->where("id", $id);
        $query = $this->db->get();
        return $query->first_row();

    }

    public function create($data) {

    	$this->db->insert("weight_plan", array(
            "start_date" => $data["startDate"],
            "end_date" => $data["endDate"],
            "start_weight" => $data["startWeight"],
            "end_weight" => $data["endWeight"]
        ));
        if (!empty($data["watchFromDate"])) {
            $weightPlan["watch_from_date"] = $data["watchFromDate"];
        }

        return $this->db->insert_id();

    }

    public function update($data) {

        $weightPlan = array(
            "start_date" => $data["startDate"],
            "end_date" => $data["endDate"],
            "start_weight" => $data["startWeight"],
            "end_weight" => $data["endWeight"],
        );
        if (!empty($data["watchFromDate"])) {
            $weightPlan["watch_from_date"] = $data["watchFromDate"];
        }

        $this->db->where("id", $data["id"]);
        $this->db->update("weight_plan", $weightPlan);

    }

    public function delete($id) {  

        $this->db->where("id", $id);
        $this->db->delete('weight_plan');

    }

}
