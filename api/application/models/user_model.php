<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User_model extends CI_Model {

    function __construct(){
        parent::__construct();
    }

    public function getById($id) {

        $this->db->from("user")->where("id", $id);
        $query = $this->db->get();
        return $query->first_row();

    }

    public function getByExternalId($id) {

        $this->db->from("user")->where("external_id", $id);
        $query = $this->db->get();
        return $query->first_row();

    }

    public function getByWeightPlanId($id) {

        $this->db->from("user")->where("weight_plan_id", $id);
        $query = $this->db->get();
        return $query->first_row();

    }

    public function getWeightsById($id, $startDate = NULL, $endDate = NULL) {

        $this->db->select("date, weight");
        $this->db->from("weight_history")->where("user_id", $id);
        if (isset($startDate) && isset($endDate)) {
            $this->db->where("date >=", $startDate);
            $this->db->where("date <=", $endDate);
        } 
        $query = $this->db->get();
        return $query->result();

    }

    public function getLastWeight($id) {

        $this->db->from("weight_history")->where("user_id", $id);
        $this->db->order_by("date", "desc");
        $query = $this->db->get();
        if ($query->num_rows() > 0) {
            return $query->first_row()->weight;
        }
        return null;

    }

    public function setWeightPlan($id, $weightPlanId) {

        $this->db->set("weight_plan_id", $weightPlanId);
        $this->db->where("id =", $id);
        $this->db->update("user");
        
    }

    public function addWeight($id, $date, $weight) {

        $this->db->where("user_id", $id);
        $this->db->where("date", $date);
        $this->db->delete('weight_history');

        $this->db->insert("weight_history", array(
            "user_id" => $id,
            "date" => $date,
            "weight" => $weight
        ));

    }

    public function getWeightPlan($id) {

        $this->db->from("user")->where("id", $id);
        $query = $this->db->get();
        if ($query->num_rows() > 0) {
            return $query->first_row();
        }
        return null;

    }

    public function create($data) {

        $this->db->insert("user", $data);
        return $this->db->insert_id();

    }

}
